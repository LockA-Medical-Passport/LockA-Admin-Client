import { NextResponse } from "next/server";
import { lockaApiErrorResponse } from "@/lib/locka-api";
import { requireSession } from "@/features/auth/guard";
import { listAuditLogForExport } from "@/features/audit/api";
import { auditCsvFilename, auditLogToCsv } from "@/features/audit/csv";
import { parseAuditQuery } from "@/features/audit/query";

/**
 * Streams the current audit filter as a CSV download. The export is generated here (rather
 * than in the browser) because only the server holds the locka-api session token — the
 * browser never sees the audit log's raw bearer credentials.
 */
export async function GET(request: Request) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const params = Object.fromEntries(new URL(request.url).searchParams);
  const query = parseAuditQuery(params);

  try {
    const page = await listAuditLogForExport(session.token, query);
    const csv = auditLogToCsv(page.items);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${auditCsvFilename()}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return lockaApiErrorResponse(error, "Unable to export the audit log");
  }
}
