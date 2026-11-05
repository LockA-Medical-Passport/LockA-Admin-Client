import { redirect } from "next/navigation";
import { LockaApiError } from "@/lib/locka-api";
import { getSession } from "@/features/auth/session";
import { listAuditLog } from "@/features/audit/api";
import { AuditLogView } from "@/features/audit/AuditLogView";
import { parseAuditQuery, type RawSearchParams } from "@/features/audit/query";
import type { AuditLogPage } from "@/features/audit/types";
import { LoadErrorState } from "@/features/provider-review/LoadErrorState";

export const metadata = {
  title: "Audit log — LockA Admin",
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const query = parseAuditQuery(await searchParams);

  let page: AuditLogPage;
  try {
    page = await listAuditLog(session.token, query);
  } catch (error) {
    return (
      <LoadErrorState
        title="Couldn't load the audit log"
        message={
          error instanceof LockaApiError
            ? error.message
            : "Something went wrong loading audit entries."
        }
      />
    );
  }

  return <AuditLogView page={page} query={query} />;
}
