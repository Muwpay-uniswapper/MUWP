import { Networks } from "@stellar/stellar-sdk";
import { SorobanSubscriptionService } from "@muwp/sdk";

export const STELLAR_NETWORKS = {
  mainnet: {
    passphrase: Networks.PUBLIC,
    sorobanRpc: "https://soroban-rpc.stellar.org",
    explorer: "https://stellar.expert/explorer/public/contract",
  },
  testnet: {
    passphrase: Networks.TESTNET,
    sorobanRpc: "https://soroban-testnet.stellar.org",
    explorer: "https://stellar.expert/explorer/testnet/contract",
  },
} as const;

export type StellarNetwork = keyof typeof STELLAR_NETWORKS;

export function resolveNetwork() {
  const name = (process.env.STELLAR_NETWORK ?? "mainnet") as StellarNetwork;
  return STELLAR_NETWORKS[name] ?? STELLAR_NETWORKS.mainnet;
}

export function resolveService(): SorobanSubscriptionService {
  const network = resolveNetwork();
  const sorobanUrl = process.env.SOROBAN_RPC_URL ?? network.sorobanRpc;
  return new SorobanSubscriptionService({ sorobanUrl, networkPassphrase: network.passphrase });
}
