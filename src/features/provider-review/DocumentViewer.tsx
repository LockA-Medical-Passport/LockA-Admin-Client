"use client";

import Image from "next/image";
import { useState } from "react";
import { EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";
import { documentPreviewKind } from "./document-preview";
import { formatBytes, formatDate } from "./format";
import type { ProviderDocument } from "./types";

export interface DocumentViewerProps {
  providerId: string;
  documents: ProviderDocument[];
}

function documentUrl(providerId: string, documentId: string, download = false) {
  const base = `/api/providers/${encodeURIComponent(providerId)}/documents/${encodeURIComponent(documentId)}`;
  return download ? `${base}?download=1` : base;
}

export function DocumentViewer({ providerId, documents }: DocumentViewerProps) {
  const [selectedId, setSelectedId] = useState(documents[0]?.id);
  const [failedIds, setFailedIds] = useState<Set<string>>(new Set());

  if (documents.length === 0) {
    return (
      <EmptyState
        title="No documents attached"
        description="This provider submitted no license scans or certificates with their application."
      />
    );
  }

  const selected = documents.find((document) => document.id === selectedId) ?? documents[0];
  const kind = failedIds.has(selected.id) ? "unsupported" : documentPreviewKind(selected.mimeType);
  const src = documentUrl(providerId, selected.id);

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <ul className="flex shrink-0 flex-col gap-2 lg:w-64">
        {documents.map((document) => {
          const size = formatBytes(document.sizeBytes);
          return (
            <li key={document.id}>
              <button
                type="button"
                onClick={() => setSelectedId(document.id)}
                aria-current={document.id === selected.id ? "true" : undefined}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50",
                  document.id === selected.id
                    ? "border-locka-cyan/40 bg-locka-cyan/10"
                    : "border-white/10 hover:bg-white/5",
                )}
              >
                <span className="block truncate text-sm font-medium text-foreground">
                  {document.name}
                </span>
                <span className="block text-xs text-foreground/50">
                  {[size, document.uploadedAt && formatDate(document.uploadedAt)]
                    .filter(Boolean)
                    .join(" · ") || document.mimeType}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        {kind === "image" && (
          <div className="relative h-[26rem] overflow-hidden rounded-lg border border-white/10 bg-navy-950/40">
            <Image
              src={src}
              alt={selected.name}
              fill
              // The document is private and served through this app's authenticated proxy, so
              // it must not go through the image optimizer.
              unoptimized
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-contain"
              onError={() => setFailedIds((current) => new Set(current).add(selected.id))}
            />
          </div>
        )}

        {kind === "pdf" && (
          <iframe
            src={src}
            title={selected.name}
            className="h-[26rem] w-full rounded-lg border border-white/10 bg-navy-950/40"
          />
        )}

        {kind === "unsupported" && (
          <div className="rounded-lg border border-white/10 bg-navy-950/40">
            <EmptyState
              title="No inline preview for this file"
              description={`${selected.mimeType} can't be shown in the browser. Download it to review the credential.`}
            />
          </div>
        )}

        <a
          href={documentUrl(providerId, selected.id, true)}
          className="self-start text-sm text-locka-cyan hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50 rounded"
        >
          Download {selected.name}
        </a>
      </div>
    </div>
  );
}
