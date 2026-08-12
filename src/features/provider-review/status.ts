import type { BadgeVariant, ButtonVariant } from "@/components/ui";
import {
  PROVIDER_STATUSES,
  PROVIDER_TYPES,
  type ProviderHistoryAction,
  type ProviderStatus,
  type ProviderType,
} from "./types";

export const PROVIDER_STATUS_LABEL: Record<ProviderStatus, string> = {
  pending: "Pending",
  verified: "Verified",
  suspended: "Suspended",
  revoked: "Revoked",
};

export const PROVIDER_STATUS_VARIANT: Record<ProviderStatus, BadgeVariant> = {
  pending: "amber",
  verified: "green",
  suspended: "gray",
  revoked: "red",
};

/** `ProviderRegistry` stores status as a u32 enum: {0: Pending, 1: Verified, 2: Suspended, 3: Revoked}. */
export const PROVIDER_STATUS_CODE: Record<ProviderStatus, number> = {
  pending: 0,
  verified: 1,
  suspended: 2,
  revoked: 3,
};

export const PROVIDER_TYPE_LABEL: Record<ProviderType, string> = {
  hospital: "Hospital",
  clinic: "Clinic",
  doctor: "Doctor",
  laboratory: "Laboratory",
  pharmacy: "Pharmacy",
  insurance_company: "Insurance Company",
  public_health_agency: "Public Health Agency",
};

export const PROVIDER_STATUS_OPTIONS = PROVIDER_STATUSES.map((status) => ({
  value: status,
  label: PROVIDER_STATUS_LABEL[status],
}));

export const PROVIDER_TYPE_OPTIONS = PROVIDER_TYPES.map((type) => ({
  value: type,
  label: PROVIDER_TYPE_LABEL[type],
}));

export function isProviderStatus(value: unknown): value is ProviderStatus {
  return PROVIDER_STATUSES.includes(value as ProviderStatus);
}

export function isProviderType(value: unknown): value is ProviderType {
  return PROVIDER_TYPES.includes(value as ProviderType);
}

export const DECISION_ACTIONS = ["approve", "reject", "suspend", "revoke"] as const;

export type DecisionAction = (typeof DECISION_ACTIONS)[number];

export function isDecisionAction(value: unknown): value is DecisionAction {
  return DECISION_ACTIONS.includes(value as DecisionAction);
}

interface DecisionCopy {
  label: string;
  buttonVariant: ButtonVariant;
  /** Registry status this decision writes. */
  resultingStatus: ProviderStatus;
  /** Reject and revoke must carry an explanation the provider can act on. */
  requiresReason: boolean;
  reasonLabel: string;
  reasonPlaceholder: string;
  /** Shown while the decision is in flight. */
  pendingMessage: string;
  successMessage: string;
}

/**
 * The registry has no "rejected" state, so a rejected application is recorded as Revoked
 * with the admin's reason — the distinction between "rejected at review" and "revoked after
 * verification" is preserved in the provider's history timeline.
 */
export const DECISION_COPY: Record<DecisionAction, DecisionCopy> = {
  approve: {
    label: "Approve",
    buttonVariant: "success",
    resultingStatus: "verified",
    requiresReason: false,
    reasonLabel: "Note (optional)",
    reasonPlaceholder: "Anything worth recording about this approval",
    pendingMessage: "Submitting approval to the ProviderRegistry…",
    successMessage: "Provider approved",
  },
  reject: {
    label: "Reject",
    buttonVariant: "danger",
    resultingStatus: "revoked",
    requiresReason: true,
    reasonLabel: "Reason for rejection",
    reasonPlaceholder: "Explain what the provider should fix before reapplying",
    pendingMessage: "Submitting rejection…",
    successMessage: "Application rejected",
  },
  suspend: {
    label: "Suspend",
    buttonVariant: "amber",
    resultingStatus: "suspended",
    requiresReason: false,
    reasonLabel: "Note (optional)",
    reasonPlaceholder: "Why access is being suspended",
    pendingMessage: "Submitting suspension to the ProviderRegistry…",
    successMessage: "Provider suspended",
  },
  revoke: {
    label: "Revoke",
    buttonVariant: "danger",
    resultingStatus: "revoked",
    requiresReason: true,
    reasonLabel: "Reason for revocation",
    reasonPlaceholder: "Why this provider's authorization is being revoked permanently",
    pendingMessage: "Submitting revocation to the ProviderRegistry…",
    successMessage: "Provider revoked",
  },
};

/** Which decisions make sense from a given registry status. Revoked is terminal. */
export function availableDecisions(status: ProviderStatus): DecisionAction[] {
  switch (status) {
    case "pending":
      return ["approve", "reject"];
    case "verified":
      return ["suspend", "revoke"];
    case "suspended":
      return ["approve", "revoke"];
    case "revoked":
      return [];
  }
}

/** Staff authorizations only exist once an organization has been verified at least once. */
export function hasAuthorizedStaff(status: ProviderStatus): boolean {
  return status === "verified" || status === "suspended";
}

/** Approving a suspended provider reinstates it, so the button says so. */
export function decisionLabel(action: DecisionAction, status: ProviderStatus): string {
  if (action === "approve" && status === "suspended") return "Reinstate";
  return DECISION_COPY[action].label;
}

export function decisionSuccessMessage(action: DecisionAction, status: ProviderStatus): string {
  if (action === "approve" && status === "suspended") return "Provider reinstated";
  return DECISION_COPY[action].successMessage;
}

export const HISTORY_ACTION_LABEL: Record<ProviderHistoryAction, string> = {
  submitted: "Application submitted",
  resubmitted: "Application resubmitted",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
  revoked: "Revoked",
  staff_revoked: "Staff authorization revoked",
};

export const HISTORY_ACTION_VARIANT: Record<ProviderHistoryAction, BadgeVariant> = {
  submitted: "cyan",
  resubmitted: "cyan",
  approved: "green",
  rejected: "red",
  suspended: "gray",
  revoked: "red",
  staff_revoked: "amber",
};
