import "server-only";
import { lockaApiJson, withAuth } from "@/lib/locka-api";
import type { DashboardSummary } from "./types";

/**
 * locka-api has not published its dashboard contract yet. The assumed endpoint is isolated
 * here so adopting the real contract is a single-file change:
 *
 *   GET /admin/dashboard/summary -> DashboardSummary
 *
 * Aggregating server-side keeps the dashboard a fixed number of rows regardless of how large
 * the provider queue grows; counting client-side would require pulling every application into
 * the admin client just to render four numbers.
 */

const UNREACHABLE = "Unable to reach the dashboard service";

export function getDashboardSummary(token: string): Promise<DashboardSummary> {
  return lockaApiJson<DashboardSummary>("/admin/dashboard/summary", {
    ...withAuth(token),
    unreachableMessage: UNREACHABLE,
  });
}
