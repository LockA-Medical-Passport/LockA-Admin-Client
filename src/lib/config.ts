function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  lockaApiUrl: required("NEXT_PUBLIC_LOCKA_API_URL", process.env.NEXT_PUBLIC_LOCKA_API_URL),
  stellarNetworkPassphrase: required(
    "NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE",
    process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE,
  ),
  sorobanRpcUrl: required("NEXT_PUBLIC_SOROBAN_RPC_URL", process.env.NEXT_PUBLIC_SOROBAN_RPC_URL),
  providerRegistryContractId: required(
    "NEXT_PUBLIC_PROVIDER_REGISTRY_CONTRACT_ID",
    process.env.NEXT_PUBLIC_PROVIDER_REGISTRY_CONTRACT_ID,
  ),
} as const;
