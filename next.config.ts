import { withSentryConfig } from "@sentry/nextjs/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Playwright runs the dev server on 127.0.0.1; Next 16 blocks dev-only asset requests from
  // origins other than the one it was started with unless they are explicitly allowed.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  telemetry: false,
  // Source maps are only uploaded when CI has an auth token. Without one, rolling back to a
  // plain production build keeps `npm run build` working for local development and forks.
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
  errorHandler: (error) => {
    console.warn("[sentry] build-time upload skipped:", error.message);
  },
});
