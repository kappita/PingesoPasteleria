import { gql } from "graphql-request";
import { client } from "../client";

const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      user {
        id
        name
        email
        roles {
          nodes {
            name
          }
        }
      }
    }
  }
`;

export async function login(username: string, password: string) {
  try {
    const { login } = await client.request(LOGIN, { username, password });
    return login;
  } catch (err: any) {
    console.error("Error en la autenticación:", err);
    throw new Error("Error en la autenticación");
  }
}
