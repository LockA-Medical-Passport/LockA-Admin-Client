import { Badge } from "@/components/ui";
import { PROVIDER_STATUS_LABEL, PROVIDER_STATUS_VARIANT } from "./status";
import type { ProviderStatus } from "./types";

export function ProviderStatusBadge({ status }: { status: ProviderStatus }) {
  return <Badge variant={PROVIDER_STATUS_VARIANT[status]}>{PROVIDER_STATUS_LABEL[status]}</Badge>;
}
