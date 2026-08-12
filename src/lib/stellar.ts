/**
 * Explorer links for Stellar transactions written by ProviderRegistry decisions.
 *
 * Pinned to testnet for the MVP, matching the network in `.env.example`. This is deliberately
 * not read from `lib/config`: that module throws when a required variable is missing, and it
 * is imported by client components that must keep rendering while the ProviderRegistry
 * contract id is still blank.
 */
const EXPLORER_BASE_URL = "https://stellar.expert/explorer/testnet";

export function stellarTxUrl(txHash: string): string {
  return `${EXPLORER_BASE_URL}/tx/${txHash}`;
}

/** Short form used in tables and timelines, e.g. `a1b2c3d4…e7f8a9`. */
export function shortTxHash(txHash: string): string {
  return txHash.length > 16 ? `${txHash.slice(0, 8)}…${txHash.slice(-6)}` : txHash;
}
