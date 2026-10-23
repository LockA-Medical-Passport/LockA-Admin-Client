import { NextResponse } from "next/server";
import { lockaApiErrorResponse } from "@/lib/locka-api";
import { requireSession } from "@/features/auth/guard";
import { listProviderApplications } from "@/features/provider-review/api";
import { parseQueueQuery } from "@/features/provider-review/query";

/** Read-only queue endpoint for the client-side real-time poller (see features/realtime). */
export async function GET(request: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const query = parseQueueQuery(params);

  try {
    const page = await listProviderApplications(session.token, query);
    return NextResponse.json(page, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return lockaApiErrorResponse(error, "Unable to reach the provider verification service");
  }
}
