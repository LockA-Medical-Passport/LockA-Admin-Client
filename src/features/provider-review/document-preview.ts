/**
 * Single source of truth for which document MIME types are safe to render inline in this
 * origin. Shared by the document route handler (`app/api/providers/[id]/documents/...`),
 * which decides `Content-Disposition: inline` vs. `attachment`, and `DocumentViewer`, which
 * decides whether to attempt an `<img>`/`<iframe>` preview — the two must never disagree, or
 * the viewer will try to inline-render something the route forces to download (or vice versa).
 *
 * Only formats that cannot carry executable script are allowed inline (no SVG, HTML, XML,
 * office documents) — see the route handler for the security rationale.
 */
const INLINE_DOCUMENT_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "application/pdf",
]);

export function canPreviewInline(mimeType: string): boolean {
  return INLINE_DOCUMENT_TYPES.has(mimeType.split(";")[0].trim().toLowerCase());
}

export function documentPreviewKind(mimeType: string): "image" | "pdf" | "unsupported" {
  if (!canPreviewInline(mimeType)) return "unsupported";
  const type = mimeType.split(";")[0].trim().toLowerCase();
  return type === "application/pdf" ? "pdf" : "image";
}
