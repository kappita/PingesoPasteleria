import { GraphQLClient } from "graphql-request";

const endpoint = process.env.WPGRAPHQL_URL!;

// Cliente sin autorización
export const client = new GraphQLClient(endpoint, {
  headers: {
    "Content-Type": "application/json",
  },
});

// Cliente con autorización
export function getAuthClient(token: string) {
  return new GraphQLClient(endpoint, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}
