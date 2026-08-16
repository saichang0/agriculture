import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { SetContextLink } from "@apollo/client/link/context";
import { TOKEN_STORAGE_KEY } from "./auth";

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:8080/query",
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
  return new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
  });
}
