import { inngest } from "./client";
import { z } from "zod";
import { Route } from "../li.fi-ts";
import { createPublicClient, extractChain, http } from "viem";
import * as chains from 'viem/chains'
import { EthereumAddress } from "../core/model/Address";
import { track } from "@vercel/analytics/server";


const Data = z.object({
    address: EthereumAddress,
    refundAddress: EthereumAddress,
    routes: z.array(Route.zod),
    totalGas: z.coerce.bigint(),
});

export const initiateTransfer = inngest.createFunction(
    {
        id: "initiate-transfer",
        retries: 10,
        triggers: [{ event: "app/transfer.initiate" }],
    },
    async ({ event, step, runId }) => {
        // const accountData = await z.object({
        //     address: EthereumAddress,
        // }).parseAsync(event.data);

        // const transfer = await step.waitForEvent("wait-for-user-to-select-route", {
        //     event: "app/transfer.initiate",
        //     match: "data.address", // the field "data.address" must match
        //     timeout: "72h", // wait at most 24h
        // });
        // if (!transfer) {
        //     return await step.sendEvent("app/terminate.account", {
        //         name: "app/terminate.account",
        //         data: {
        //             address: accountData.address,
        //         }
        //     })
        // }

        const data = await Data.parseAsync(event.data);

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
            });

            if (!transaction || transaction.status !== "success") {
                throw new Error("Transaction not found")
            }
            try {
                // Calculate volume in USD
                const volume = data.routes.reduce((acc, route) => {
                    return acc + Number(route.fromAmountUSD);
                }, 0);

                await track('Swap started', {
                    ...input,
                    inngestID: runId,
                    volume,
                });
            } catch (e) {
                console.error(e);
            }
        })

        await step.sendEvent("app/consume.steps", data.routes.map((route, index) => ({
            id: `app/consume.steps/${route.id}`,
            name: "app/consume.steps",
            data: {
                address: data.address,
                remainingSteps: route.steps,
                totalRoutes: data.routes.length,
                id: route.id,
                index,
                refundAddress: data.refundAddress,
                originalChainId: route.steps[0].action.fromChainId,
            }
        })))
    });