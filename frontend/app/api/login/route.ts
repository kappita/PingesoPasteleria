import { NextResponse } from "next/server";
import { login } from "@/app/lib/graphql/auth/login";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const { authToken, user } = await login(username, password);

    if (!authToken) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set("authToken", authToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 día
    });

    return NextResponse.json({ user });
  } catch (err) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 }
    );
  }
}
