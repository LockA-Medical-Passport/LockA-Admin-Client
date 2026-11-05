import type { init } from "@sentry/nextjs";

/**
 * Sentry stays off outside production builds, and off in production until a DSN is configured.
 * This keeps local development and tests quiet while still making deployed environments
 * monitored by default once `NEXT_PUBLIC_SENTRY_DSN` is set.
 */
export const sentryEnabled =
  process.env.NODE_ENV === "production" && Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);

/**
 * Strip request context, user identity, and breadcrumbs before an event leaves the app.
 * Admin sessions are httpOnly-cookie authenticated and provider applications contain PII, so
 * none of that may be forwarded to a third-party error service.
 */
export function scrubSentryEvent<T extends object>(event: T): T {
  const scrubbed = event as T & {
    request?: unknown;
    user?: unknown;
    breadcrumbs?: unknown;
  };
  delete scrubbed.request;
  delete scrubbed.user;
  delete scrubbed.breadcrumbs;
  return event;
}

export const sharedSentryOptions: Parameters<typeof init>[0] = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: sentryEnabled,
  tracesSampleRate: 0.1,
  beforeSend: scrubSentryEvent,
};
