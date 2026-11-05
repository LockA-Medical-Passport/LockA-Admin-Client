import { redirect } from "next/navigation";
import { LockaApiError } from "@/lib/locka-api";
import { getSession } from "@/features/auth/session";
import { getDashboardSummary } from "@/features/dashboard/api";
import { DashboardView } from "@/features/dashboard/DashboardView";
import type { DashboardSummary } from "@/features/dashboard/types";
import { LoadErrorState } from "@/features/provider-review/LoadErrorState";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  let summary: DashboardSummary;
  try {
    summary = await getDashboardSummary(session.token);
  } catch (error) {
    return (
      <LoadErrorState
        title="Couldn't load the dashboard"
        message={
          error instanceof LockaApiError
            ? error.message
            : "Something went wrong loading the application summary."
        }
      />
    );
  }

  return <DashboardView summary={summary} />;
}
