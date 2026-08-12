import { NextResponse } from "next/server";
import { LockaApiError } from "@/lib/locka-api";
import { requireSession } from "@/features/auth/guard";
import { submitProviderDecision } from "@/features/provider-review/api";
import { DECISION_COPY, isDecisionAction } from "@/features/provider-review/status";
import type { BulkDecisionResult } from "@/features/provider-review/types";

/** One page of the queue is the most a single bulk action can cover. */
const MAX_BULK_SIZE = 100;

export async function POST(request: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const body = await request.json().catch(() => null);
  const action = body?.action;
  const reason = typeof body?.reason === "string" ? body.reason.trim() : "";
  const rawIds: unknown[] = Array.isArray(body?.ids) ? body.ids : [];
  const ids = [
    ...new Set(rawIds.filter((id): id is string => typeof id === "string" && id.length > 0)),
  ];

  if (!isDecisionAction(action)) {
    return NextResponse.json(
      { message: "action must be one of approve, reject, suspend, revoke" },
      { status: 400 },
    );
  }

  if (ids.length === 0) {
    return NextResponse.json({ message: "Select at least one application" }, { status: 400 });
  }

  if (ids.length > MAX_BULK_SIZE) {
    return NextResponse.json(
      { message: `A bulk action can cover at most ${MAX_BULK_SIZE} applications` },
      { status: 400 },
    );
  }

  if (DECISION_COPY[action].requiresReason && !reason) {
    return NextResponse.json(
      { message: `A reason is required to ${action} a provider` },
      { status: 400 },
    );
  }

  // allSettled, not all: one provider failing (already decided elsewhere, registry write
  // rejected) must not hide the outcome of the rest — the UI reports per application.
  const settled = await Promise.allSettled(
    ids.map((id) =>
      submitProviderDecision(session.token, id, { action, reason: reason || undefined }),
    ),
  );

  const results: BulkDecisionResult[] = settled.map((outcome, index) => {
    const id = ids[index];
    if (outcome.status === "fulfilled") {
      return {
        id,
        name: outcome.value.provider?.name,
        ok: true,
        txHash: outcome.value.txHash,
      };
    }
    return {
      id,
      ok: false,
      message:
        outcome.reason instanceof LockaApiError
          ? outcome.reason.message
          : "Unable to reach the provider verification service",
    };
  });

  return NextResponse.json({ results });
}
