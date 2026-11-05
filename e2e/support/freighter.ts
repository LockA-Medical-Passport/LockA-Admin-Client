import type { Page } from "@playwright/test";

export const E2E_STELLAR_PASSPHRASE = "Test SDF Network ; September 2015";
export const E2E_WALLET_PUBLIC_KEY = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

interface FreighterRequest {
  source?: string;
  messageId?: number;
  type?: string;
  transactionXdr?: string;
}

/**
 * Fakes the Freighter browser extension's postMessage protocol. The app still exercises its
 * own wallet connect/state-management code; only the extension itself (and the chain, via
 * NEXT_PUBLIC_E2E_TEST_MODE) is mocked.
 */
export async function installMockFreighter(page: Page) {
  await page.addInitScript(
    ({ passphrase, publicKey }) => {
      (window as unknown as { freighter: boolean }).freighter = true;

      window.addEventListener("message", (event) => {
        const request = event.data as FreighterRequest;
        if (request?.source !== "FREIGHTER_EXTERNAL_MSG_REQUEST") return;

        const response: Record<string, unknown> = {
          source: "FREIGHTER_EXTERNAL_MSG_RESPONSE",
          messagedId: request.messageId,
        };

        switch (request.type) {
          case "REQUEST_ACCESS":
            response.publicKey = publicKey;
            break;
          case "REQUEST_NETWORK_DETAILS":
            response.networkDetails = {
              network: "TESTNET",
              networkName: "Test SDF Network",
              networkUrl: "",
              networkPassphrase: passphrase,
              sorobanRpcUrl: "",
            };
            break;
          case "SUBMIT_TRANSACTION":
            response.signedTransaction = request.transactionXdr;
            response.signerAddress = publicKey;
            break;
          default:
            break;
        }

        window.postMessage(response, window.location.origin);
      });
    },
    { passphrase: E2E_STELLAR_PASSPHRASE, publicKey: E2E_WALLET_PUBLIC_KEY },
  );
}
