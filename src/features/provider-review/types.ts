/**
 * Domain types for provider application review.
 *
 * `ProviderStatus` and `ProviderType` mirror the enums the `ProviderRegistry` Soroban
 * contract exposes, so the admin UI never invents a state the chain cannot represent.
 */

export const PROVIDER_STATUSES = ["pending", "verified", "suspended", "revoked"] as const;

export type ProviderStatus = (typeof PROVIDER_STATUSES)[number];

export const PROVIDER_TYPES = [
  "hospital",
  "clinic",
  "doctor",
  "laboratory",
  "pharmacy",
  "insurance_company",
  "public_health_agency",
] as const;

export type ProviderType = (typeof PROVIDER_TYPES)[number];

export interface ProviderApplication {
  id: string;
  /** Organization name, or the practitioner's name for an individual `doctor` provider. */
  name: string;
  type: ProviderType;
  country: string;
  status: ProviderStatus;
  /** ISO-8601 timestamp of the provider's registration submission. */
  submittedAt: string;
  /** Stellar account the provider registered with (`G...`). */
  walletAddress: string;
  licenseNumber: string;
  /** Hash of the license document as recorded on-chain. */
  licenseHash?: string;
  contactEmail?: string;
  contactPhone?: string;
  website?: string;
  addressLine?: string;
  /**
   * Status last read back from `ProviderRegistry`. Absent until locka-api has indexed a
   * registry event for this provider — which is how "approved here, not yet on-chain" and
   * "written on-chain" are told apart in the detail view.
   */
  onChainStatus?: ProviderStatus;
  onChainSyncedAt?: string;
  /** Stellar transaction that last wrote this provider's registry entry. */
  lastTxHash?: string;
  decidedAt?: string;
  decisionReason?: string;
  documents?: ProviderDocument[];
}

export interface ProviderDocument {
  id: string;
  name: string;
  /** Content type reported by locka-api; drives inline preview vs. download fallback. */
  mimeType: string;
  sizeBytes?: number;
  uploadedAt?: string;
}

export type ProviderHistoryAction =
  "submitted" | "resubmitted" | "approved" | "rejected" | "suspended" | "revoked" | "staff_revoked";

export interface ProviderHistoryEntry {
  id: string;
  action: ProviderHistoryAction;
  /** ISO-8601 timestamp. */
  occurredAt: string;
  actorName?: string;
  actorEmail?: string;
  note?: string;
  txHash?: string;
}

export interface ProviderStaff {
  id: string;
  name: string;
  email?: string;
  /** Free-text role as captured by the provider organization (e.g. "Radiologist"). */
  role?: string;
  walletAddress?: string;
  status: "active" | "revoked";
  authorizedAt?: string;
  revokedAt?: string;
}

export interface ProviderQueuePage {
  items: ProviderApplication[];
  /** Total rows matching the filters, across all pages. */
  total: number;
  page: number;
  pageSize: number;
  /** Distinct countries across the whole queue, used to populate the country filter. */
  countries?: string[];
}

export interface ProviderDecisionResult {
  provider: ProviderApplication;
  /**
   * The already-confirmed `ProviderRegistry` transaction this decision was recorded against
   * (signed client-side via Freighter — see `features/provider-review/decisions.ts`). Echoed
   * back from locka-api mainly so a response type doesn't need a second, separate shape.
   */
  txHash: string;
}

export interface ProviderStaffRevocationResult {
  staff: ProviderStaff;
  txHash?: string;
}

/** Per-application outcome of a bulk approve/reject, so partial failures stay visible. */
export interface BulkDecisionResult {
  id: string;
  name?: string;
  ok: boolean;
  txHash?: string;
  message?: string;
}
