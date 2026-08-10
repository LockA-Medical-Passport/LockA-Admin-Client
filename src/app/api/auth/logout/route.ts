import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { logoutAdmin } from "@/features/auth/api";
import { SESSION_COOKIE_NAME } from "@/features/auth/session-cookie";

export async function POST() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await logoutAdmin(token);
  }
  store.delete(SESSION_COOKIE_NAME);

  return NextResponse.json({ ok: true });
}
