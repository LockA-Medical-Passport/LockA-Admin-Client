import {
  Account,
  Address,
  BASE_FEE,
  Contract,
  TimeoutInfinite,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
  type Transaction,
} from "@stellar/stellar-sdk";
import { NULL_ACCOUNT } from "@stellar/stellar-sdk/contract";
import { config } from "@/lib/config";
import { PROVIDER_STATUS_CODE, type DecisionAction } from "@/features/provider-review/status";
import type { ProviderStatus } from "@/features/provider-review/types";
import { sorobanServer } from "./client";
import { SorobanError, errorMessage } from "./errors";

/**
 * `locka-contracts` (the Soroban `ProviderRegistry` contract) has not published its interface
 * yet — this module's assumed function names and argument/return shapes are isolated here,
 * exactly like `features/auth/api.ts` and `features/provider-review/api.ts` do for locka-api,
 * so adopting the real contract interface is a one-file change:
 *
 *   get_provider_status(provider: Address) -> u32          ({0: Pending, 1: Verified, 2: Suspended, 3: Revoked})
 *   get_provider(provider: Address)        -> Map<Symbol, Val>   (assumed to include a `status` field, at minimum)
 *   list_by_status(status: u32)            -> Vec<Address>
 *   approve_provider(admin: Address, provider: Address) -> ()
 *   suspend_provider(admin: Address, provider: Address) -> ()
 *   revoke_provider(admin: Address, provider: Address)  -> ()
 *
 * Providers are identified on-chain by the Stellar address they registered with
 * (`ProviderApplication.walletAddress`), not locka-api's own record id.
 *
 * There is no on-chain "rejected" status — the registry only knows Pending/Verified/
 * Suspended/Revoked (see `features/provider-review/status.ts`), so a rejected application and
 * a revoked one both call `revoke_provider`; the distinction between "rejected at review" and
 * "revoked after verification" is off-chain, recorded by locka-api against the confirmed tx
 * hash (see `features/provider-review/decisions.ts`). The contract also isn't assumed to
 * store a reason/note on-chain at all — that stays off-chain for the same reason.
 */

const STATUS_BY_CODE: Record<number, ProviderStatus> = {
  0: "pending",
  1: "verified",
  2: "suspended",
  3: "revoked",
};

function providerStatusFromCode(code: number): ProviderStatus | null {
  return STATUS_BY_CODE[code] ?? null;
}

const CONTRACT_METHOD_BY_ACTION: Record<DecisionAction, string> = {
  approve: "approve_provider",
  reject: "revoke_provider",
  suspend: "suspend_provider",
  revoke: "revoke_provider",
};

function registryContract(): Contract {
  return new Contract(config.providerRegistryContractId);
}

function decodeScValField(val: xdr.ScVal): unknown {
  // scValToNative doesn't unwrap addresses (see its own doc comment), so those need
  // decoding by hand; everything else it handles natively.
  if (val.switch() === xdr.ScValType.scvAddress()) {
    return Address.fromScVal(val).toString();
  }
  return scValToNative(val);
}

function decodeScMap(val: xdr.ScVal): Record<string, unknown> {
  const record: Record<string, unknown> = {};
  for (const entry of val.map() ?? []) {
    const key = scValToNative(entry.key());
    if (typeof key === "string") record[key] = decodeScValField(entry.val());
  }
  return record;
}

function decodeAddressVec(val: xdr.ScVal): string[] {
  return (val.vec() ?? []).map((entry) => Address.fromScVal(entry).toString());
}

/** Simulates a read-only invocation using the SDK's own placeholder account (never signed or submitted, so its balance/existence is irrelevant). */
async function simulateRead(method: string, ...args: xdr.ScVal[]): Promise<xdr.ScVal> {
  const account = new Account(NULL_ACCOUNT, "0");
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.stellarNetworkPassphrase,
  })
    .addOperation(registryContract().call(method, ...args))
    .setTimeout(TimeoutInfinite)
    .build();

  let sim: rpc.Api.SimulateTransactionResponse;
  try {
    sim = await sorobanServer().simulateTransaction(tx);
  } catch (error) {
    throw new SorobanError(
      `Unable to reach the Soroban RPC endpoint: ${errorMessage(error)}`,
      "network",
    );
  }

  if (rpc.Api.isSimulationError(sim)) {
    throw new SorobanError(sim.error, "simulation");
  }
  if (!sim.result) {
    throw new SorobanError(`${method} returned no result`, "simulation");
  }
  return sim.result.retval;
}

export async function getProviderStatus(providerAddress: string): Promise<ProviderStatus | null> {
  const retval = await simulateRead(
    "get_provider_status",
    Address.fromString(providerAddress).toScVal(),
  );
  if (retval.switch() === xdr.ScValType.scvVoid()) return null;

  const code = Number(scValToNative(retval));
  const status = providerStatusFromCode(code);
  if (status === null) {
    throw new SorobanError(
      `get_provider_status returned an unrecognized status code: ${code}`,
      "simulation",
    );
  }
  return status;
}

export interface OnChainProviderRecord {
  status: ProviderStatus;
  /**
   * Every other field `get_provider` returned, decoded but not given a typed shape — the
   * contract's full record schema isn't published yet (see the module doc comment above).
   */
  raw: Record<string, unknown>;
}

export async function getProvider(providerAddress: string): Promise<OnChainProviderRecord | null> {
  const retval = await simulateRead("get_provider", Address.fromString(providerAddress).toScVal());
  if (retval.switch() === xdr.ScValType.scvVoid()) return null;

  const raw = decodeScMap(retval);
  const status = providerStatusFromCode(Number(raw.status));
  if (status === null) {
    throw new SorobanError(
      `get_provider returned an unrecognized status: ${String(raw.status)}`,
      "simulation",
    );
  }
  return { status, raw };
}

/** Provider addresses currently at a given status, per the registry's own on-chain index. */
export async function listProvidersByStatus(status: ProviderStatus): Promise<string[]> {
  const retval = await simulateRead(
    "list_by_status",
    nativeToScVal(PROVIDER_STATUS_CODE[status], { type: "u32" }),
  );
  return decodeAddressVec(retval);
}

/** Convenience wrapper for the queue's default view — see `listProvidersByStatus`. */
export function listPendingProviders(): Promise<string[]> {
  return listProvidersByStatus("pending");
}

/** Builds and simulates the transaction for a decision, returning unsigned XDR ready for Freighter. */
export async function buildDecisionTransaction(params: {
  action: DecisionAction;
  providerAddress: string;
  adminAddress: string;
}): Promise<string> {
  const server = sorobanServer();

  let account: Account;
  try {
    account = await server.getAccount(params.adminAddress);
  } catch (error) {
    throw new SorobanError(
      `Unable to load your account from the Stellar network: ${errorMessage(error)}`,
      "network",
    );
  }

  const operation = registryContract().call(
    CONTRACT_METHOD_BY_ACTION[params.action],
    Address.fromString(params.adminAddress).toScVal(),
    Address.fromString(params.providerAddress).toScVal(),
  );

  // 60s gives the admin a realistic window to review and approve in the Freighter popup
  // without leaving the transaction validity open-ended.
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.stellarNetworkPassphrase,
  })
    .addOperation(operation)
    .setTimeout(60)
    .build();

  let prepared: Transaction;
  try {
    prepared = await server.prepareTransaction(tx);
  } catch (error) {
    throw new SorobanError(errorMessage(error), "simulation");
  }

  return prepared.toXDR();
}

export interface SubmittedTransaction {
  txHash: string;
}

/** Submits an already-signed transaction envelope. Returns as soon as it's accepted into the pending pool — call `confirmTransaction` to learn the outcome. */
export async function submitSignedTransaction(signedXdr: string): Promise<SubmittedTransaction> {
  const server = sorobanServer();
  const tx = TransactionBuilder.fromXDR(signedXdr, config.stellarNetworkPassphrase);

  let sendResult: rpc.Api.SendTransactionResponse;
  try {
    sendResult = await server.sendTransaction(tx);
  } catch (error) {
    throw new SorobanError(`Unable to submit the transaction: ${errorMessage(error)}`, "network");
  }

  if (sendResult.status === "ERROR") {
    throw new SorobanError(
      "The network rejected the transaction before it could be applied.",
      "failed",
    );
  }
  if (sendResult.status === "TRY_AGAIN_LATER") {
    throw new SorobanError(
      "The network is busy right now. Please try again in a moment.",
      "network",
    );
  }
  // PENDING and DUPLICATE (a retried submission of the same envelope) both mean the network
  // already has it queued — confirmTransaction below is what determines the real outcome.

  return { txHash: sendResult.hash };
}

/**
 * A quick, single-shot server-side check that a client-supplied transaction hash actually
 * landed successfully — used to gate `POST /api/providers/:id/decision` (see that route)
 * before it asks locka-api to record a decision against it, rather than trusting a regex-shaped
 * string on faith. This confirms the ledger genuinely applied *some* successful transaction
 * with this hash; it does not (yet) decode the envelope to confirm it specifically invoked
 * `ProviderRegistry` for this provider — the contract's exact call shape isn't published yet
 * (see the module doc comment), and getting that decode wrong would be worse than not
 * attempting it. Closing that remaining gap is real follow-up work, not a stand-in for it.
 */
export async function wasTransactionSuccessful(txHash: string): Promise<boolean> {
  try {
    const result = await sorobanServer().getTransaction(txHash);
    return result.status === rpc.Api.GetTransactionStatus.SUCCESS;
  } catch {
    return false;
  }
}

export type ConfirmationOutcome = { status: "SUCCESS" } | { status: "FAILED"; message: string };

const CONFIRMATION_ATTEMPTS = 30;

/** Polls until the submitted transaction lands (success or failure) or the polling budget runs out. */
export async function confirmTransaction(txHash: string): Promise<ConfirmationOutcome> {
  const server = sorobanServer();

  let result: rpc.Api.GetTransactionResponse;
  try {
    result = await server.pollTransaction(txHash, {
      attempts: CONFIRMATION_ATTEMPTS,
      sleepStrategy: rpc.BasicSleepStrategy,
    });
  } catch (error) {
    throw new SorobanError(`Unable to confirm the transaction: ${errorMessage(error)}`, "network");
  }

  if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
    return { status: "SUCCESS" };
  }
  if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
    return {
      status: "FAILED",
      message: "The transaction failed once it was applied to the ledger.",
    };
  }

  throw new SorobanError(
    "Still waiting on network confirmation — check the transaction link again shortly.",
    "timeout",
  );
}
