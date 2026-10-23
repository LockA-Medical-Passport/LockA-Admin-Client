/**
 * A deliberately narrow "demo mode" used by the Playwright suite (and by anyone running the
 * client against the mock locka-api without a funded Stellar account).
 *
 * It only replaces the two things E2E cannot provide in CI — a Freighter extension and a live
 * Soroban network — so the UI flow can be exercised end to end. It never bypasses the
 * locka-api session: route handlers still require a real bearer token from the mock server.
 *
 * Gated on `NODE_ENV !== "production"` as well as the explicit flag, so a demo flag that
 * leaks into a production build still cannot skip on-chain verification.
 */
export const DEMO_MODE =
  process.env.NEXT_PUBLIC_DEMO_MODE === "1" && process.env.NODE_ENV !== "production";

export const DEMO_WALLET_ADDRESS = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

/** 64 hex characters, matching the transaction-hash format the decision route validates. */
export const DEMO_TX_HASH = "ab".repeat(32);
