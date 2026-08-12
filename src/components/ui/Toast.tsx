"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { shortTxHash, stellarTxUrl } from "@/lib/stellar";
import { cn } from "@/lib/utils";
import { Spinner } from "./Spinner";
import {
  dismissToast,
  getToastSnapshot,
  subscribeToasts,
  type ToastItem,
  type ToastVariant,
} from "./toast-store";

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: "border-brand-green/30",
  error: "border-brand-red/30",
  pending: "border-locka-cyan/30",
};

const VARIANT_ICON_COLOR: Record<ToastVariant, string> = {
  success: "text-brand-green",
  error: "text-brand-red",
  pending: "text-locka-cyan",
};

function emptyToastList(): ToastItem[] {
  return [];
}

export function Toaster() {
  const toasts = useSyncExternalStore(subscribeToasts, getToastSnapshot, emptyToastList);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      role="region"
      aria-label="Notifications"
      className="pointer-events-none fixed inset-x-0 top-4 z-100 flex flex-col items-center gap-2 px-4 sm:right-4 sm:left-auto sm:items-end"
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </div>,
    document.body,
  );
}

function ToastCard({ item }: { item: ToastItem }) {
  return (
    <div
      role="status"
      className={cn(
        "glass-bright animate-slide-up pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg",
        VARIANT_STYLES[item.variant],
      )}
    >
      <StatusIcon variant={item.variant} />
      <div className="min-w-0 flex-1">
        {item.title && <p className="text-sm font-semibold text-foreground">{item.title}</p>}
        <p className="text-sm text-foreground/80">{item.message}</p>
        {item.txHash && (
          <a
            href={stellarTxUrl(item.txHash)}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block font-mono text-xs text-locka-cyan hover:underline"
          >
            {shortTxHash(item.txHash)}
          </a>
        )}
      </div>
      <button
        type="button"
        onClick={() => dismissToast(item.id)}
        aria-label="Dismiss notification"
        className="shrink-0 text-foreground/40 hover:text-foreground"
      >
        <svg viewBox="0 0 20 20" className="size-4" aria-hidden="true">
          <path
            d="M5 5l10 10M15 5 5 15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

function StatusIcon({ variant }: { variant: ToastVariant }) {
  if (variant === "pending") {
    return <Spinner size="sm" className={cn("mt-0.5 shrink-0", VARIANT_ICON_COLOR.pending)} />;
  }

  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden="true"
      className={cn("mt-0.5 size-5 shrink-0", VARIANT_ICON_COLOR[variant])}
    >
      <circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {variant === "success" ? (
        <path
          d="M6 10.5l2.5 2.5L14 7.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M7 7l6 6M13 7l-6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
