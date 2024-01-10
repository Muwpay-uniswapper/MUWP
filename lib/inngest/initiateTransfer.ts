import { inngest } from "./client";
import { z } from "zod";
import { Route } from "../li.fi-ts";
import { createPublicClient, extractChain, http } from "viem";
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

const Data = z.object({
    address: Address,
    routes: z.array(Route.zod),
    totalGas: z.coerce.bigint(),
});

export const initiateTransfer = inngest.createFunction(
    {
        id: "initiate-transfer",
        retries: 10
    },
    { event: "app/account.created" },
    async ({ event, step }) => {
        const accountData = await z.object({
            address: Address,
        }).parseAsync(event.data);

        const transfer = await step.waitForEvent("wait-for-user-to-select-route", {
            event: "app/transfer.initiate",
            match: "data.address", // the field "data.address" must match
            timeout: "72h", // wait at most 24h
        });
        if (!transfer) {
            return await step.sendEvent("app/terminate.account", {
                name: "app/terminate.account",
                data: {
                    address: accountData.address,
                }
            })
        }

        const data = await Data.parseAsync(transfer.data);

        const funds_transferred = await step.waitForEvent("wait-for-user-to-transfer-funds", {
            event: "app/funds.transferred",
            match: "data.address", // the field "data.address" must match
            timeout: "30d", // wait at most 30 days
        });

        if (!funds_transferred) {
            return await step.sendEvent("app/terminate.account", {
                name: "app/terminate.account",
                data: {
                    address: data.address,
                }
            })
        }

        await step.waitForEvent("wait-for-chain-to-confirm-transaction", {
            event: "app/chain.transaction.confirmed",
            match: "data.address", // the field "data.address" must match
            timeout: "15min", // wait at most 15 min
        });

        await step.run("app/transfer.funds", async () => {
            const input = funds_transferred?.data
            const client = createPublicClient({
                chain: extractChain({
                    chains: Object.values(chains),
                    id: input.chainId as any,
                }),
                transport: http()
            })

            const transaction = await client.getTransactionReceipt({
                hash: input.transactionHash as `0x${string}`,
            })

            if (!transaction || transaction.status !== "success") {
                throw new Error("Transaction not found")
            }
        })

        await step.sendEvent("app/consume.steps", data.routes.map(route => ({
            name: "app/consume.steps",
            data: {
                address: data.address,
                remainingSteps: route.steps,
                totalRoutes: data.routes.length,
                id: route.id,
                originalChainId: route.steps[0].action.fromChainId,
            }
        })))
    });