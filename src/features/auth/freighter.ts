import {
  getNetwork,
  isConnected,
  requestAccess,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api";
import { config } from "@/lib/config";

export interface FreighterConnectResult {
  address: string | null;
  notInstalled: boolean;
  error: string | null;
}

/** Thin wrapper around @stellar/freighter-api so callers never import the SDK directly. */
export async function connectFreighter(): Promise<FreighterConnectResult> {
  const connected = await isConnected();
  if (connected.error || !connected.isConnected) {
    return { address: null, notInstalled: true, error: null };
  }

  const access = await requestAccess();
  if (access.error) {
    return { address: null, notInstalled: false, error: access.error.message };
  }

  return { address: access.address, notInstalled: false, error: null };
}

export interface FreighterSignResult {
  signedXdr: string | null;
  error: string | null;
}

function isUserRejection(message: string): boolean {
  // Deliberately narrow: "cancel" alone also shows up in unrelated network/timeout messages
  // (e.g. "request canceled"), which would mislabel a real connectivity failure as a decline.
  return /reject|declin/i.test(message);
}

/**
 * Signs a transaction envelope built for this app's configured network. Refuses to sign
 * against a different network — Freighter lets the admin switch networks independently of
 * this app, and signing a ProviderRegistry call meant for testnet against mainnet (or vice
 * versa) would either silently fail on submit or, worse, hit a same-named contract on the
 * wrong network.
 */
export async function signFreighterTransaction(
  unsignedXdr: string,
  address: string,
): Promise<FreighterSignResult> {
  const network = await getNetwork();
  if (network.error) {
    return { signedXdr: null, error: network.error.message };
  }
  if (network.networkPassphrase !== config.stellarNetworkPassphrase) {
    return {
      signedXdr: null,
      error: `Freighter is connected to the wrong network. Switch it to match "${config.stellarNetworkPassphrase}" and try again.`,
    };
  }

  const result = await freighterSignTransaction(unsignedXdr, {
    address,
    networkPassphrase: config.stellarNetworkPassphrase,
  });
  if (result.error) {
    const message = result.error.message;
    return {
      signedXdr: null,
      error: isUserRejection(message) ? "You declined the request in Freighter." : message,
    };
  }

  return { signedXdr: result.signedTxXdr, error: null };
}
