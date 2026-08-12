import { NextResponse } from "next/server";
import { LockaApiError } from "@/lib/locka-api";
import { requireSession } from "@/features/auth/guard";
import { submitProviderDecision } from "@/features/provider-review/api";
import { DECISION_COPY, isDecisionAction } from "@/features/provider-review/status";

/**
 * Both admin roles review applications — a reviewer's whole job is approving and rejecting —
 * so this is gated on a valid session rather than a role. Admin-user management is what
 * `requireRole(["super_admin"])` protects.
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const action = body?.action;
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";

  if (!isDecisionAction(action)) {
    return NextResponse.json(
      { message: "action must be one of approve, reject, suspend, revoke" },
      { status: 400 },
    );
  }

  if (DECISION_COPY[action].requiresReason && !reason) {
    return NextResponse.json(
      { message: `A reason is required to ${action} a provider` },
      { status: 400 },
    );
  }

  try {
    const result = await submitProviderDecision(session.token, id, {
      action,
      reason: reason || undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof LockaApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { message: "Unable to reach the provider verification service" },
      { status: 502 },
    );
  }
}
