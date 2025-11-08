import { gql } from "graphql-request";
import { getAuthClient } from "../client";

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

export async function getViewer(token: string) {
  const authClient = getAuthClient(token);

  const { viewer } = await authClient.request(VIEWER);
  return viewer;
}
