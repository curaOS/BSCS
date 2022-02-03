import { ApolloClient, InMemoryCache } from "@apollo/client";
import { graphUri } from "./config";

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        nfts: {
          keyArgs: false,
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
      },
    },
  },
});

const client = new ApolloClient({
  uri: graphUri,
  cache: cache,
});

export default client;
