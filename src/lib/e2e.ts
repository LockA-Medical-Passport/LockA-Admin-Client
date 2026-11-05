/**
 * Test-only switch for the Playwright end-to-end suite.
 *
 * The full approval flow normally requires a Freighter signature and a live Soroban network.
 * The E2E suite runs against a mocked locka-api and has no chain available, so when this flag
 * is set the client skips building/signing/submitting the on-chain transaction and the
 * decision route skips its RPC confirmation check. It must never be enabled in a deployed
 * environment; `.env.example` and `docs/environments.md` document that explicitly.
 */
export const isE2eTestMode = process.env.NEXT_PUBLIC_E2E_TEST_MODE === "1";
