import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import { TOKEN_STORAGE_KEY } from "./auth";

const GRAPHQL_HTTP_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:8080/query";
const GRAPHQL_WS_URL = process.env.NEXT_PUBLIC_GRAPHQL_WS_URL ?? GRAPHQL_HTTP_URL.replace(/^http/, "ws");

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

export function makeApolloClient() {
  const httpChain = authLink.concat(httpLink);

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
