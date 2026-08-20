import "server-only";
import { lockaApiJson, lockaApiRequest, withAuth } from "@/lib/locka-api";
import type { QueueQuery } from "./query";
import type { DecisionAction } from "./status";
import type {
  ProviderApplication,
  ProviderDecisionResult,
  ProviderHistoryEntry,
  ProviderQueuePage,
  ProviderStaff,
  ProviderStaffRevocationResult,
} from "./types";

/**
 * locka-api has not published its provider-verification contract yet. As with
 * `features/auth/api.ts`, every assumed endpoint and payload shape is isolated in this one
 * file so adopting the real contract is a single-file change:
 *
 *   GET  /admin/providers?status&type&country&q&sort&direction&page&pageSize -> ProviderQueuePage
 *   GET  /admin/providers/:id                                    -> ProviderApplication
 *   GET  /admin/providers/:id/history                            -> ProviderHistoryEntry[]
 *   GET  /admin/providers/:id/staff                              -> ProviderStaff[]
 *   GET  /admin/providers/:id/documents/:documentId                       -> raw document bytes
 *   POST /admin/providers/:id/decision { action, reason?, txHash }        -> ProviderDecisionResult
 *   POST /admin/providers/:id/staff/:staffId/revoke { reason? }           -> ProviderStaffRevocationResult
 *
 * Filtering, sorting and pagination are pushed to locka-api rather than done here: the queue
 * is expected to grow, and the admin client should never pull the full table to show 25 rows.
 *
 * The `ProviderRegistry` write behind a decision is signed and submitted client-side, by the
 * admin's own Freighter wallet, via `lib/soroban/provider-registry.ts` — locka-api never holds
 * a key that could write to the registry. This endpoint's `decision` call happens *after* that
 * transaction has already confirmed on-chain; `txHash` identifies it, and locka-api's job here
 * is just to record the reason/note against it (see `features/provider-review/decisions.ts`).
 * The authoritative on-chain status locka-api reports back (`onChainStatus`/`lastTxHash` on
 * `ProviderApplication`) still comes from its own `ProviderRegistry` event indexer, not from
 * this call — that's what keeps the queue honest even for writes made outside this client.
 */

const UNREACHABLE = "Unable to reach the provider verification service";

function providerApiJson<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  return lockaApiJson<T>(path, { ...withAuth(token, init), unreachableMessage: UNREACHABLE });
}

export function listProviderApplications(
  token: string,
  query: QueueQuery,
): Promise<ProviderQueuePage> {
  const params = new URLSearchParams({
    sort: query.sort,
    direction: query.direction,
    page: String(query.page),
    pageSize: String(query.pageSize),
  });
  if (query.status !== "all") params.set("status", query.status);
  if (query.type !== "all") params.set("type", query.type);
  if (query.country !== "all") params.set("country", query.country);
  if (query.q) params.set("q", query.q);

  return providerApiJson<ProviderQueuePage>(`/admin/providers?${params}`, token);
}

export function getProviderApplication(token: string, id: string): Promise<ProviderApplication> {
  return providerApiJson<ProviderApplication>(`/admin/providers/${encodeURIComponent(id)}`, token);
}

export function getProviderHistory(token: string, id: string): Promise<ProviderHistoryEntry[]> {
  return providerApiJson<ProviderHistoryEntry[]>(
    `/admin/providers/${encodeURIComponent(id)}/history`,
    token,
  );
}

export function getProviderStaff(token: string, id: string): Promise<ProviderStaff[]> {
  return providerApiJson<ProviderStaff[]>(
    `/admin/providers/${encodeURIComponent(id)}/staff`,
    token,
  );
}

export function submitProviderDecision(
  token: string,
  id: string,
  input: { action: DecisionAction; reason?: string; txHash: string },
): Promise<ProviderDecisionResult> {
  return providerApiJson<ProviderDecisionResult>(
    `/admin/providers/${encodeURIComponent(id)}/decision`,
    token,
    { method: "POST", body: JSON.stringify(input) },
  );
}

export function revokeProviderStaff(
  token: string,
  id: string,
  staffId: string,
  reason?: string,
): Promise<ProviderStaffRevocationResult> {
  return providerApiJson<ProviderStaffRevocationResult>(
    `/admin/providers/${encodeURIComponent(id)}/staff/${encodeURIComponent(staffId)}/revoke`,
    token,
    { method: "POST", body: JSON.stringify({ reason }) },
  );
}

/** Returns the upstream response so the route handler can stream the bytes straight through. */
export function fetchProviderDocument(
  token: string,
  id: string,
  documentId: string,
): Promise<Response> {
  return lockaApiRequest(
    `/admin/providers/${encodeURIComponent(id)}/documents/${encodeURIComponent(documentId)}`,
    { ...withAuth(token), unreachableMessage: UNREACHABLE },
  );
}
