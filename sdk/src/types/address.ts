import { z } from "zod";

export const EthereumAddressSchema = z
  .string()
  .regex(/^(0x)?[0-9a-fA-F]{40}$/, "Invalid Ethereum address.");

export const SolanaAddressSchema = z
  .string()
  .regex(/^[5KL1-9A-HJ-NP-Za-km-z]{32,44}$/, "Invalid Solana address.");

export const AptosAddressSchema = z
  .string()
  .regex(/^(0x)?[0-9a-fA-F]{64}$/, "Invalid Aptos address.");

export const AddressSchema = z.union([
  EthereumAddressSchema,
  SolanaAddressSchema,
  AptosAddressSchema,
  z.string()
]);

export type Address = z.infer<typeof AddressSchema>;
export type EthereumAddress = z.infer<typeof EthereumAddressSchema>;

