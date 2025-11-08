import { gql } from "graphql-request";
import { client } from "../client";

const GetPRODUCTS = gql`
  query GetProducts {
    products {
      nodes {
        description
        shortDescription
        status
        title
      }
    }
  }
`;

export async function getProducts() {
  const { products } = await client.request(GetPRODUCTS);
  return products.nodes;
}
