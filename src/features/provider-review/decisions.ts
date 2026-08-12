import { dismissToast, toast } from "@/components/ui";
import type { DecisionAction } from "./status";
import type {
  BulkDecisionResult,
  ProviderDecisionResult,
  ProviderStaffRevocationResult,
} from "./types";

/**
 * Client-side calls into this app's own route handlers. The browser never talks to locka-api
 * directly — the session token is httpOnly — so every mutation goes through `/api/providers/*`.
 */

export type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

async function postJson<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      return { ok: false, message: payload?.message ?? "Something went wrong. Please try again." };
    }
    return { ok: true, data: payload as T };
  } catch {
    return { ok: false, message: "Unable to reach the server. Check your connection and retry." };
  }
}

/**
 * Shows a sticky "in flight" toast for the duration of the call, so a decision that waits on
 * a Stellar transaction reads as pending -> success/failure rather than as a frozen button.
 */
export async function withPendingToast<T>(
  message: string,
  run: () => Promise<ApiResult<T>>,
): Promise<ApiResult<T>> {
  const toastId = toast.pending(message);
  try {
    return await run();
  } finally {
    dismissToast(toastId);
  }
}

export function submitDecision(
  providerId: string,
  action: DecisionAction,
  reason?: string,
): Promise<ApiResult<ProviderDecisionResult>> {
  return postJson<ProviderDecisionResult>(
    `/api/providers/${encodeURIComponent(providerId)}/decision`,
    { action, reason },
  );
}

export function submitBulkDecision(
  ids: string[],
  action: DecisionAction,
  reason?: string,
): Promise<ApiResult<{ results: BulkDecisionResult[] }>> {
  return postJson<{ results: BulkDecisionResult[] }>("/api/providers/bulk-decision", {
    ids,
    action,
    reason,
  });
}

export function submitStaffRevocation(
  providerId: string,
  staffId: string,
  reason?: string,
): Promise<ApiResult<ProviderStaffRevocationResult>> {
  return postJson<ProviderStaffRevocationResult>(
    `/api/providers/${encodeURIComponent(providerId)}/staff/${encodeURIComponent(staffId)}/revoke`,
    { reason },
  );
}
