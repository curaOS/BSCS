import { ApolloClient, InMemoryCache } from "@apollo/client";
import { graphUri } from "./config";

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        nfts: {
          keyArgs: ["id"],
          merge(existing = [], incoming, { args }) {
            const merged = existing ? existing.slice(0) : [];
            const end = args.skip + Math.min(args.first, incoming.length);
            for (let i = args.skip; i < end; ++i) {
              merged[i] = incoming[i - args.skip];
            }
            return merged;
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
