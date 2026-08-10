import { NextResponse } from "next/server";
import { inviteAdminUser, AuthApiError } from "@/features/auth/api";
import { requireRole } from "@/features/auth/guard";
import type { AdminRole } from "@/features/auth/types";

const VALID_ROLES: AdminRole[] = ["super_admin", "reviewer"];

export async function POST(request: Request) {
  const { session, response } = await requireRole(["super_admin"]);
  if (!session) return response;

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const role = body?.role;

  if (!email || !VALID_ROLES.includes(role)) {
    return NextResponse.json({ message: "A valid email and role are required" }, { status: 400 });
  }

  try {
    const admin = await inviteAdminUser(session.token, { email, role });
    return NextResponse.json(admin, { status: 201 });
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
