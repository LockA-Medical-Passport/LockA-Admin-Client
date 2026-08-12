import { redirect } from "next/navigation";
import { LockaApiError } from "@/lib/locka-api";
import { getSession } from "@/features/auth/session";
import { listProviderApplications } from "@/features/provider-review/api";
import { LoadErrorState } from "@/features/provider-review/LoadErrorState";
import { ProviderQueueView } from "@/features/provider-review/ProviderQueueView";
import { parseQueueQuery, type RawSearchParams } from "@/features/provider-review/query";
import type { ProviderQueuePage } from "@/features/provider-review/types";

export const metadata = {
  title: "Applications — LockA Admin",
};

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  // Filters, sort and pagination come from the URL and go straight to locka-api, so the
  // server only ever renders the page the admin actually asked for.
  const query = parseQueueQuery(await searchParams);

  let page: ProviderQueuePage;
  try {
    page = await listProviderApplications(session.token, query);
  } catch (error) {
    return (
      <LoadErrorState
        title="Couldn't load the application queue"
        message={
          error instanceof LockaApiError
            ? error.message
            : "Something went wrong loading provider applications."
        }
      />
    );
  }

  return <ProviderQueueView page={page} query={query} />;
}
