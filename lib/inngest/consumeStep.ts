import { inngest } from "./client";
import { z } from "zod";
import * as store from "@/lib/kv/store";
import { Step } from "../li.fi-ts";
import { publicClient } from "@/app/providers";
import { advancedAPI } from "../front/data/api";
import { HDAccount, HttpTransport, PublicClient, createPublicClient, createWalletClient, extractChain, fromHex, getContract, http, zeroAddress } from 'viem'
import { HDKey, hdKeyToAccount } from 'viem/accounts'
import * as chains from 'viem/chains'
import { WalletClient, erc20ABI } from "wagmi";

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
    { event: "app/consume.steps" },
    async ({ event, step }) => {
        const { remainingSteps, address } = await z.object({
            address: Address,
            remainingSteps: z.array(Step.zod),
            id: z.string(),
        }).parseAsync(event.data);

        if (remainingSteps.length === 0) return; // Should not happen, but just in case

        const _step = remainingSteps[0];

        const { hash, chainId } = await step.run(`step-${_step.id}`, async () => {
            const fullStep = await advancedAPI.advancedStepTransactionPost(_step as Step);
            const transactionRequest = await transactionRequestSchema.parseAsync(fullStep.transactionRequest)
            if (fullStep.action.fromAddress !== address) throw new Error("Address mismatch")

            const { walletClient, publicClient } = await getWallet(address, fullStep.transactionRequest.chainId);

            if (fullStep.action.fromToken.address !== zeroAddress && fullStep.estimate) {
                // Approvals
                const contract = getContract({
                    address: fullStep.action.fromToken.address as `0x${string}`,
                    abi: erc20ABI,
                    publicClient: publicClient!,
                    walletClient: walletClient!,
                })

                const allowance = await contract.read.allowance([
                    walletClient.account.address as `0x${string}`,
                    fullStep.estimate!.approvalAddress as `0x${string}`
                ]) // TODO: Replace with router address

                const amount = BigInt(fullStep.action.fromAmount)

                if (allowance < amount) {
                    const hash = await contract.write.approve([fullStep.estimate!.approvalAddress as `0x${string}`, amount])

                    await publicClient.waitForTransactionReceipt({ hash }) // This may take a while and make the workflow timeout. In that case, it will just be retried
                }
            }

            console.log("Sending transaction", transactionRequest)

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

        const _remainingSteps = remainingSteps.slice(1);

        if (_remainingSteps.length >= 0) {
            return await step.sendEvent("app/consume.steps", {
                name: "app/consume.steps",
                data: {
                    address,
                    remainingSteps: _remainingSteps,
                }
            })
        }

        return await step.sendEvent("app/route.completed", {
            name: "app/route.completed",
            data: {
                address,
                id: event.data.id,
            }
        })
    },
);

export async function getWallet(address: string, chainId: number): Promise<{
    walletClient: WalletClient<HttpTransport, chains.Chain, HDAccount>,
    publicClient: PublicClient
}> {
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
    return { walletClient, publicClient: client as PublicClient };
}
