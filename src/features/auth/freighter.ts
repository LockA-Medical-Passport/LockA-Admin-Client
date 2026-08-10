import { isConnected, requestAccess } from "@stellar/freighter-api";

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
