import { rpc } from "@stellar/stellar-sdk";
import { config } from "@/lib/config";

/**
 * Runs in the browser as well as on the server: Freighter can only sign from a page context,
 * so the write flow (build tx -> sign -> submit -> poll) all happens client-side against this
 * same RPC endpoint. `NEXT_PUBLIC_SOROBAN_RPC_URL`/`NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE`
 * make the network (testnet/mainnet) and contract configurable purely via env, with no code
 * change needed to point this client at a different network.
 */
let server: rpc.Server | null = null;

export function sorobanServer(): rpc.Server {
  if (!server) {
    server = new rpc.Server(config.sorobanRpcUrl, {
      allowHttp: config.sorobanRpcUrl.startsWith("http://"),
    });
  }
  return server;
}
