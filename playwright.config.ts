import { defineConfig, devices } from "@playwright/test";

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  // The mock backend keeps the provider queue in memory, so specs must not race each other.
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "node e2e/mock-locka-api.mjs",
      url: "http://127.0.0.1:4000/health",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "npm run dev",
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        ...process.env,
        NEXT_PUBLIC_LOCKA_API_URL: "http://127.0.0.1:4000",
        NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE: "Test SDF Network ; September 2015",
        NEXT_PUBLIC_SOROBAN_RPC_URL: "https://soroban-testnet.stellar.org",
        NEXT_PUBLIC_PROVIDER_REGISTRY_CONTRACT_ID: `C${"A".repeat(55)}`,
        // Replaces Freighter + Soroban only; session/auth still flows through the mock API.
        NEXT_PUBLIC_DEMO_MODE: "1",
      },
    },
  ],
});
