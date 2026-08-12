import { NextResponse } from "next/server";
import { lockaApiErrorResponse } from "@/lib/locka-api";
import { requireSession } from "@/features/auth/guard";
import { revokeProviderStaff } from "@/features/provider-review/api";

/** Revokes one staff member's authorization, leaving the provider organization verified. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; staffId: string }> },
) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const { id, staffId } = await params;
  const body = await request.json().catch(() => null);
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

  try {
    const result = await revokeProviderStaff(session.token, id, staffId, reason || undefined);
    return NextResponse.json(result);
  } catch (error) {
    return lockaApiErrorResponse(error, "Unable to reach the provider verification service");
  }
}
