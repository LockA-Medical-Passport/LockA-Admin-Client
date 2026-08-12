import { NextResponse } from "next/server";
import { LockaApiError } from "@/lib/locka-api";
import { requireSession } from "@/features/auth/guard";
import { fetchProviderDocument } from "@/features/provider-review/api";
import { canPreviewInline } from "@/features/provider-review/document-preview";

/**
 * Streams a provider's credential document through this app so the browser can render it:
 * locka-api needs the session bearer token, which only exists server-side.
 *
 * Only formats that cannot execute script are rendered inline (`canPreviewInline`, shared
 * with `DocumentViewer` so the two never disagree on what gets a preview). Anything else —
 * HTML, SVG, XML, office documents — is forced to download, so a malicious upload can never
 * run in this admin's origin. `nosniff` keeps the browser from re-interpreting a mislabelled
 * payload.
 */

function sanitizeFilename(value: string): string {
  const cleaned = value.replace(/[^\w.\-]+/g, "_").replace(/^\.+/, "");
  return cleaned.slice(0, 100) || "document";
}

function filenameFrom(upstream: Response, fallback: string): string {
  const disposition = upstream.headers.get("content-disposition");
  const match = disposition?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
  return sanitizeFilename(match?.[1] ?? fallback);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; documentId: string }> },
) {
  const { session, response } = await requireSession();
  if (!session) return response;

  const { id, documentId } = await params;
  const forceDownload = new URL(request.url).searchParams.get("download") === "1";

  try {
    const upstream = await fetchProviderDocument(session.token, id, documentId);
    const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
    const inline = !forceDownload && canPreviewInline(contentType);
    const filename = filenameFrom(upstream, documentId);

    const headers = new Headers({
      "Content-Type": contentType,
      "Content-Disposition": inline ? "inline" : `attachment; filename="${filename}"`,
      "X-Content-Type-Options": "nosniff",
      // Credential documents are personal data: never let a proxy or the browser keep a copy.
      "Cache-Control": "private, no-store",
    });

    // Downloads are never rendered by us, so sandbox them into an opaque origin as a second
    // layer behind the inline allowlist. PDFs are left unsandboxed because the browser's
    // built-in viewer needs to run.
    if (!inline) headers.set("Content-Security-Policy", "sandbox");

    const contentLength = upstream.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);

    return new NextResponse(upstream.body, { headers });
  } catch (error) {
    if (error instanceof LockaApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json(
      { message: "Unable to reach the provider verification service" },
      { status: 502 },
    );
  }
}
