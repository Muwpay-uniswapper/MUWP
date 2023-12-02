import { inngest } from "./client";
import { z } from "zod";
import * as store from "@/lib/kv/store";
import { Step } from "../li.fi-ts";
import { publicClient } from "@/app/providers";
import { advancedAPI } from "../front/data/api";
import { createPublicClient, createWalletClient, extractChain, fromHex, http } from 'viem'
import { HDKey, hdKeyToAccount } from 'viem/accounts'
import * as chains from 'viem/chains'

const Address = z
    .string()
    .refine(value =>
        /^(0x)?[0-9a-fA-F]{40}$/.test(value),
        {
            message: 'Invalid Ethereum address.',
            path: [], // path is kept empty to indicate whole string should be validated
        }
    );
const Hash = z.string().refine(value => value.startsWith('0x'), {
    message: "Hash/Hex must start with '0x'",
});

const transactionRequestSchema = z.object({
    from: Address, // Ethereum address format
    to: Address, // Ethereum address format
    chainId: z.number().int(), // Chain ID should be an integer
    data: Hash, // Data field should start with 0x followed by hex characters
    value: Hash, // Value should be in hex format
    gasPrice: Hash, // Gas price should be in hex format
    gasLimit: Hash, // Gas limit should be in hex format
});


export const consumeStep = inngest.createFunction(
    { id: "consume-step" },
    { event: "app/consume.step" },
    async ({ event, step }) => {
        const { step: _step, address } = z.object({
            address: Address,
            step: Step.zod
        }).parse(event.data);

        const { hash, chainId } = await step.run(`step-${_step.id}`, async () => {
            const fullStep = await advancedAPI.advancedStepTransactionPost(_step as Step);
            const transactionRequest = transactionRequestSchema.parse(fullStep.transactionRequest)
            if (fullStep.action.fromAddress !== address) throw new Error("Address mismatch")

            const walletClient = await getWallet(address, fullStep.transactionRequest.chainId);

            const hash = await walletClient.sendTransaction({
                data: transactionRequest.data as `0x${string}`,
                to: transactionRequest.to as `0x${string}`,
                value: fromHex(transactionRequest.value as `0x${string}`, "bigint"),
            })

            return { hash, chainId: fullStep.transactionRequest.chainId }
        })
        await step.waitForEvent(`transaction-${hash}`, {
            event: "app/transaction.executed",
            match: "data.hash",
            timeout: `${(_step.estimate?.executionDuration ?? 60) * 1.3}s`, // wait at most 30% longer than estimated
        })

        await step.run(`step-${_step.id}-executed`, async () => {
            // Check if the step was executed
            const client = createPublicClient({
                chain: extractChain({
                    chains: Object.values(chains),
                    id: chainId
                }),
                transport: http()
            })
            const tx = await client.getTransactionReceipt({ hash })
            if (tx.status !== "success") {
                throw new Error("Transaction failed")
            }
        })

        await step.sendEvent("step-completed", {
            name: "app/step.completed",
            data: {
                id: _step.id,
            },
        })
    },
);

async function getWallet(address: string, chainId: number) {
    const master_hd = process.env.MASTER_HD?.trim() as `0x${string}`;
    const privateKey = fromHex(master_hd, "bytes");
    const hdKey = HDKey.fromMasterSeed(privateKey);

    const index = await store.get(address) as string;

    const account = hdKeyToAccount(hdKey, {
        accountIndex: Number(index),
    });

    const client = createPublicClient({
        chain: extractChain({
            chains: Object.values(chains),
            id: chainId as any,
        }),
        transport: http()
    })

    const walletClient = createWalletClient({
        account,
        chain: client.chain,
        transport: http()
    });
    return walletClient;
}
