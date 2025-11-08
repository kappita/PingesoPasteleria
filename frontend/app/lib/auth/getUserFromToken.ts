import { gql, GraphQLClient } from "graphql-request";

const VIEWER = gql`
  query Viewer {
    viewer {
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
`;

export async function getUserFromToken(token: string) {
  if (!token) return null;

  const client = new GraphQLClient(process.env.NEXT_PUBLIC_WP_GRAPHQL_URL!, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  try {
    const { viewer } = await client.request(VIEWER);
    return viewer;
  } catch (err) {
    console.error("Error verificando token:", err);
    return null;
  }
}
