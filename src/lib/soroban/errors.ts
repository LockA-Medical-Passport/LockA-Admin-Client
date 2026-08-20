/**
 * Distinguishes *why* a Soroban RPC interaction failed, so callers can decide how to react
 * (retry, tell the admin to switch networks, just show the contract's error text) without
 * parsing message strings.
 *
 * - `network`   the RPC endpoint couldn't be reached, or a read/write request itself errored
 * - `simulation` the contract rejected the call during simulation (bad state transition,
 *                 unauthorized, etc.) — `message` is the contract/RPC's own error text
 * - `rejected`  the admin declined the request in their wallet
 * - `failed`    the transaction was accepted but failed once applied to the ledger
 * - `timeout`   the transaction is still unresolved after the polling budget was exhausted
 */
export type SorobanErrorCode = "network" | "simulation" | "rejected" | "failed" | "timeout";

export class SorobanError extends Error {
  code: SorobanErrorCode;

  constructor(message: string, code: SorobanErrorCode) {
    super(message);
    this.name = "SorobanError";
    this.code = code;
  }
}

export { errorMessage } from "@/lib/utils";
