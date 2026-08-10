import { NextResponse } from "next/server";
import { updateAdminUserStatus, AuthApiError } from "@/features/auth/api";
import { requireRole } from "@/features/auth/guard";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireRole(["super_admin"]);
  if (!session) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;

  if (status !== "active" && status !== "deactivated") {
    return NextResponse.json(
      { message: "status must be 'active' or 'deactivated'" },
      { status: 400 },
    );
  }

  try {
    const admin = await updateAdminUserStatus(session.token, id, status);
    return NextResponse.json(admin);
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
