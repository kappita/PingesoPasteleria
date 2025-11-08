import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getViewer } from "@/app/lib/graphql/auth/viewer";

export async function GET() {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("authToken")?.value;
  if (!token) return NextResponse.json({ viewer: null });

  try {
    const viewer = await getViewer(token);
    return NextResponse.json({ viewer });
  } catch {
    return NextResponse.json({ viewer: null });
  }
}
