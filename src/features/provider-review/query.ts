import { isProviderStatus, isProviderType } from "./status";
import type { ProviderStatus, ProviderType } from "./types";

/**
 * The queue's search/filter/sort/pagination state lives entirely in the URL, so a filtered
 * view is shareable and survives a refresh or a back/forward navigation. This module is the
 * single place that decodes and encodes it.
 */

export const QUEUE_SORT_KEYS = ["submittedAt", "name", "status"] as const;

export type QueueSortKey = (typeof QUEUE_SORT_KEYS)[number];

export type QueueSortDirection = "asc" | "desc";

export const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

export interface QueueQuery {
  status: ProviderStatus | "all";
  type: ProviderType | "all";
  country: string;
  /** Free-text search across provider name and license number. */
  q: string;
  sort: QueueSortKey;
  direction: QueueSortDirection;
  page: number;
  pageSize: number;
}

/** Newest pending applications first: the queue opens on the work that needs review. */
export const DEFAULT_QUEUE_QUERY: QueueQuery = {
  status: "pending",
  type: "all",
  country: "all",
  q: "",
  sort: "submittedAt",
  direction: "desc",
  page: 1,
  pageSize: PAGE_SIZE_OPTIONS[0],
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseQueueQuery(params: RawSearchParams): QueueQuery {
  const status = firstValue(params.status);
  const type = firstValue(params.type);
  const country = firstValue(params.country)?.trim();
  const sort = firstValue(params.sort);
  const direction = firstValue(params.direction);
  const pageSize = parsePositiveInt(firstValue(params.pageSize), DEFAULT_QUEUE_QUERY.pageSize);

  return {
    status: isProviderStatus(status) || status === "all" ? status : DEFAULT_QUEUE_QUERY.status,
    type: isProviderType(type) || type === "all" ? type : DEFAULT_QUEUE_QUERY.type,
    country: country || DEFAULT_QUEUE_QUERY.country,
    q: firstValue(params.q)?.trim() ?? DEFAULT_QUEUE_QUERY.q,
    sort: QUEUE_SORT_KEYS.includes(sort as QueueSortKey)
      ? (sort as QueueSortKey)
      : DEFAULT_QUEUE_QUERY.sort,
    direction:
      direction === "asc" || direction === "desc" ? direction : DEFAULT_QUEUE_QUERY.direction,
    page: parsePositiveInt(firstValue(params.page), DEFAULT_QUEUE_QUERY.page),
    // An arbitrary ?pageSize=100000 would let one request drag the whole queue out of
    // locka-api, so only the sizes the UI offers are honoured.
    pageSize: (PAGE_SIZE_OPTIONS as readonly number[]).includes(pageSize)
      ? pageSize
      : DEFAULT_QUEUE_QUERY.pageSize,
  };
}

/** Only non-default values are serialized, so the common case stays a clean `/applications`. */
export function queueSearchParams(query: QueueQuery): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== DEFAULT_QUEUE_QUERY[key as keyof QueueQuery]) {
      params.set(key, String(value));
    }
  }
  params.sort();
  return params;
}

export function queueHref(query: QueueQuery): string {
  const params = queueSearchParams(query).toString();
  return params ? `/applications?${params}` : "/applications";
}

export function isDefaultQueueFilter(query: QueueQuery): boolean {
  return (
    query.status === DEFAULT_QUEUE_QUERY.status &&
    query.type === DEFAULT_QUEUE_QUERY.type &&
    query.country === DEFAULT_QUEUE_QUERY.country &&
    query.q === DEFAULT_QUEUE_QUERY.q
  );
}
