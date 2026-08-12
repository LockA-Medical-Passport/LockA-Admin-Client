import { notFound, redirect } from "next/navigation";
import { LockaApiError } from "@/lib/locka-api";
import { getSession } from "@/features/auth/session";
import {
  getProviderApplication,
  getProviderHistory,
  getProviderStaff,
} from "@/features/provider-review/api";
import { LoadErrorState } from "@/features/provider-review/LoadErrorState";
import { ProviderDetail } from "@/features/provider-review/ProviderDetail";
import { parseQueueQuery, queueHref } from "@/features/provider-review/query";
import { hasAuthorizedStaff } from "@/features/provider-review/status";
import type { ProviderApplication } from "@/features/provider-review/types";

export const metadata = {
  title: "Provider application — LockA Admin",
};

/**
 * `from` carries the queue's filters so the back link returns to the list the admin was
 * working through. It is re-parsed through `parseQueueQuery` rather than trusted, so an
 * arbitrary value can only ever produce a valid `/applications` URL.
 */
function backHrefFrom(from: string | string[] | undefined): string {
  if (typeof from !== "string" || !from) return "/applications";
  const params = Object.fromEntries(new URLSearchParams(from));
  return queueHref(parseQueueQuery(params));
}

export default async function ProviderApplicationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;

  // History is supporting context for every status, so it loads alongside the application;
  // a failure here must not blank out the decision screen.
  const providerRequest = getProviderApplication(session.token, id);
  const historyRequest = getProviderHistory(session.token, id).catch(() => []);

  let provider: ProviderApplication;
  try {
    provider = await providerRequest;
  } catch (error) {
    if (error instanceof LockaApiError && error.status === 404) notFound();
    return (
      <LoadErrorState
        title="Couldn't load this application"
        message={
          error instanceof LockaApiError
            ? error.message
            : "Something went wrong loading this provider application."
        }
      />
    );
  }

  // Staff authorizations only exist once a provider has been verified, and knowing that
  // requires `provider` first — most detail views are for pending applications, so this
  // avoids a locka-api round trip that would be thrown away.
  const staff = hasAuthorizedStaff(provider.status)
    ? await getProviderStaff(session.token, id).catch(() => [])
    : [];
  const history = await historyRequest;

  return (
    <ProviderDetail
      provider={provider}
      history={history}
      staff={staff}
      backHref={backHrefFrom((await searchParams).from)}
    />
  );
}
