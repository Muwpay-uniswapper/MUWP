import { z } from "zod";

export const EthereumAddress = z
    .string()
    .regex(/^(0x)?[0-9a-fA-F]{40}$/, 'Invalid Ethereum address.');

export const SolanaAddress = z
    .string()
    .regex(/^[5KL1-9A-HJ-NP-Za-km-z]{32,44}$/, 'Invalid Solana address.');

export const AptosAddress = z
    .string()
    .regex(/^(0x)?[0-9a-fA-F]{64}$/, 'Invalid Aptos address.');

export const Address = z.union([EthereumAddress, SolanaAddress, AptosAddress, z.string()]);