"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";

import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Sentry is disabled outside production or when no DSN is configured, so this is a no-op
    // locally. `beforeSend` strips request/user/breadcrumb data before it leaves the browser.
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full items-center justify-center bg-navy-950 px-6 py-16 text-foreground">
        <main className="glass-bright flex max-w-md flex-col items-center gap-5 rounded-2xl p-8 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-brand-red/15 text-brand-red">
            <svg viewBox="0 0 24 24" className="size-6" fill="none" aria-hidden="true">
              <path
                d="M12 8v5M12 16.5v.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                d="M10.3 3.8 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
            <p className="text-sm text-foreground/60">
              The admin client hit an unexpected error. You can try again, or return to the
              dashboard if it keeps happening.
            </p>
            {error.digest && (
              <p className="font-mono text-xs text-foreground/40">Reference: {error.digest}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-locka-blue px-4 text-sm font-medium text-white transition-colors hover:bg-locka-blue/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
            >
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-white/10 bg-navy-700/60 px-4 text-sm font-medium text-foreground transition-colors hover:bg-navy-600/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
            >
              Return to dashboard
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
