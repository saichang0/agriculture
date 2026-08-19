import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { ErrorLink } from "@apollo/client/link/error";
import { CombinedGraphQLErrors } from "@apollo/client/errors";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { from, concatMap, throwError } from "rxjs";
import { TOKEN_STORAGE_KEY, getRefreshToken, setTokens, clearToken } from "./auth";

const GRAPHQL_HTTP_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:8080/query";
const GRAPHQL_WS_URL = process.env.NEXT_PUBLIC_GRAPHQL_WS_URL ?? GRAPHQL_HTTP_URL.replace(/^http/, "ws");

const REFRESH_TOKEN_MUTATION = `
  mutation RefreshToken($refreshToken: String!) {
    refreshToken(refreshToken: $refreshToken) {
      token
      refreshToken
    }
  }
`;

// Multiple requests can 401 at once (e.g. a page that fires several queries on
// load) — without this, each would kick off its own refresh call, and the
// server-side rotation (old refresh token deleted, new one issued) means only
// the first would succeed and the rest would wrongly log the user out.
let refreshPromise: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(GRAPHQL_HTTP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: REFRESH_TOKEN_MUTATION, variables: { refreshToken } }),
    });
    const json = await res.json();
    const payload = json?.data?.refreshToken;
    if (!payload?.token || !payload?.refreshToken) return null;

    setTokens(payload.token, payload.refreshToken);
    return payload.token as string;
  } catch {
    return null;
  }
}

function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

const httpLink = new HttpLink({
  uri: GRAPHQL_HTTP_URL,
});

const authLink = new SetContextLink(({ headers }) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
  return {
    headers: {
      ...headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

const refreshLink = new ErrorLink(({ error, operation, forward }) => {
  if (typeof window === "undefined") return;
  if (!CombinedGraphQLErrors.is(error)) return;

  const isUnauthenticated = error.errors.some(
    (e) => (e.extensions as { code?: string } | undefined)?.code === "UNAUTHENTICATED"
  );
  if (!isUnauthenticated) return;

  // No refresh token at all means the user was never logged in this session
  // (or already logged out) — nothing to retry, let the error surface so the
  // app's own "redirect to /login" effect can run.
  if (!getRefreshToken()) return;

  return from(refreshAccessToken()).pipe(
    concatMap((newToken) => {
      if (!newToken) {
        clearToken();
        window.location.href = "/login";
        return throwError(() => error);
      }
      operation.setContext(({ headers }: { headers?: Record<string, string> }) => ({
        headers: { ...headers, authorization: `Bearer ${newToken}` },
      }));
      return forward(operation);
    })
  );
});

export function makeApolloClient() {
  const httpChain = authLink.concat(refreshLink).concat(httpLink);

  // The WS link is only created in the browser — graphql-ws opens a real
  // socket on construction, which has no meaning during server rendering.
  const link =
    typeof window === "undefined"
      ? httpChain
      : split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === "OperationDefinition" && definition.operation === "subscription"
            );
          },
          new GraphQLWsLink(
            createClient({
              url: GRAPHQL_WS_URL,
              connectionParams: () => {
                const token = localStorage.getItem(TOKEN_STORAGE_KEY);
                return token ? { authorization: `Bearer ${token}` } : {};
              },
            })
          ),
          httpChain
        );

  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
}
