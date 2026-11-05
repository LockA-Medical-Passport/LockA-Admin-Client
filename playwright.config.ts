import { defineConfig, devices } from "@playwright/test";

const APP_PORT = Number(process.env.E2E_PORT ?? 3100);
const MOCK_API_PORT = Number(process.env.MOCK_API_PORT ?? 4100);
const MOCK_API_URL = `http://127.0.0.1:${MOCK_API_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 20_000 },
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${APP_PORT}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    navigationTimeout: 30_000,
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: [
    {
      command: "node e2e/mock-api.mjs",
      url: `${MOCK_API_URL}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
      env: { MOCK_API_PORT: String(MOCK_API_PORT) },
    },
    {
      // A production server keeps E2E results independent of Turbopack compile latency and
      // exercises the same output CI deploys. `npm run build` needs the NEXT_PUBLIC_* env below.
      command: `npm run build && npm run start -- --port ${APP_PORT}`,
      url: `http://127.0.0.1:${APP_PORT}/login`,
      reuseExistingServer: !process.env.CI,
      timeout: 300_000,
      env: {
        NEXT_PUBLIC_LOCKA_API_URL: MOCK_API_URL,
        NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: "Test SDF Network ; September 2015",
        NEXT_PUBLIC_SOROBAN_RPC_URL: "http://127.0.0.1:9/soroban",
        NEXT_PUBLIC_PROVIDER_REGISTRY_CONTRACT_ID:
          "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        NEXT_PUBLIC_E2E_TEST_MODE: "1",
        NEXT_TELEMETRY_DISABLED: "1",
      },
    },
  ],
});
