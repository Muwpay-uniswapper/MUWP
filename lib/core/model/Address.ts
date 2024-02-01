import { z } from "zod";

export const EthereumAddress = z
    .string()
    .refine(value =>
        /^(0x)?[0-9a-fA-F]{40}$/.test(value),
        {
            message: 'Invalid Ethereum address.',
            path: [], // path is kept empty to indicate whole string should be validated
        }
    );

export const SolanaAddress = z
    .string()
    .refine(value =>
        /^[5KL1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value),
        {
            message: 'Invalid Solana address.',
            path: [], // path is kept empty to indicate whole string should be validated
        }
    );

export const AptosAddress = z
    .string()
    .refine(value =>
        /^(0x)?[0-9a-fA-F]{64}$/.test(value),
        {
            message: 'Invalid Aptos address.',
            path: [], // path is kept empty to indicate whole string should be validated
        }
    );

export const Address = z.union([EthereumAddress, SolanaAddress, AptosAddress]);