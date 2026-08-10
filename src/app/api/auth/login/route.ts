import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { loginAdmin, AuthApiError } from "@/features/auth/api";
import {
  DEFAULT_SESSION_MAX_AGE_SECONDS,
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
} from "@/features/auth/session-cookie";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
  }

  try {
    const { token, expiresInSeconds, admin } = await loginAdmin(email, password);
    (await cookies()).set(SESSION_COOKIE_NAME, token, {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: expiresInSeconds ?? DEFAULT_SESSION_MAX_AGE_SECONDS,
    });
    return NextResponse.json({ admin });
  } catch (error) {
    if (error instanceof AuthApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { message: "Unable to reach the authentication service" },
      { status: 502 },
    );
  }
}
