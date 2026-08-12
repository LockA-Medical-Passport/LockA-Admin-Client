import { NextResponse } from "next/server";
import { lockaApiErrorResponse } from "@/lib/locka-api";
import { wasTransactionSuccessful } from "@/lib/soroban/provider-registry";
import { requireSession } from "@/features/auth/guard";
import { submitProviderDecision } from "@/features/provider-review/api";
import { DECISION_COPY, isDecisionAction } from "@/features/provider-review/status";

/**
 * The `ProviderRegistry` write itself now happens client-side, signed by the admin's own
 * Freighter wallet, before this route is ever called (see
 * `features/provider-review/decisions.ts`). This endpoint's job is narrower than its name
 * suggests: record the reason/note against an already-confirmed transaction, which is why
 * `txHash` is required here rather than something this route produces.
 *
 * `txHash` is client-supplied, so it's re-checked against Soroban RPC itself
 * (`wasTransactionSuccessful`) rather than trusted on format alone — a regex only proves the
 * string looks like a hash, not that anything actually happened on-chain.
 *
 * Both admin roles review applications — a reviewer's whole job is approving and rejecting —
 * so this is gated on a valid session rather than a role. Admin-user management is what
 * `requireRole(["super_admin"])` protects.
 */
const TX_HASH_PATTERN = /^[0-9a-f]{64}$/i;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const action = body?.action;
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
  const txHash = typeof body?.txHash === "string" ? body.txHash.trim() : "";

  if (!isDecisionAction(action)) {
    return NextResponse.json(
      { message: "action must be one of approve, reject, suspend, revoke" },
      { status: 400 },
    );
  }

  if (!TX_HASH_PATTERN.test(txHash)) {
    return NextResponse.json(
      { message: "txHash must be the confirmed ProviderRegistry transaction hash" },
      { status: 400 },
    );
  }

  if (!(await wasTransactionSuccessful(txHash))) {
    return NextResponse.json(
      { message: "That transaction hash wasn't found as a successful transaction on the network" },
      { status: 422 },
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
      txHash,
    });
    return NextResponse.json(result);
  } catch (error) {
    return lockaApiErrorResponse(error, "Unable to reach the provider verification service");
  }
}
