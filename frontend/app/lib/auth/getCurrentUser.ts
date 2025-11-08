import { getAuthToken } from "./getAuthToken";
import { getUserFromToken } from "./getUserFromToken";

export async function getCurrentUser() {
  const token = await getAuthToken();
  if (!token) return null;

  const user = await getUserFromToken(token);
  return user;
}
