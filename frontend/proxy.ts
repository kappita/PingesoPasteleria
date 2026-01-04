import { cookies } from "next/dist/server/request/cookies";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(req: NextRequest) {
  const cookiesStore = await cookies();
  const token = cookiesStore.get("authToken")?.value;
  const { pathname } = req.nextUrl;

  // Rutas que requieren login
  const protectedRoutes = ["/my-account"];

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Aplica el middleware solo a las rutas protegidas
export const config = {
  matcher: ["/my-account/:path*"],
};
