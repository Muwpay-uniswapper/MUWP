import { inngest } from "./client";
import { z } from "zod";
import { Route } from "../li.fi-ts";


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
    { id: "initiate-transfer" },
    { event: "app/account.created" },
    async ({ event, step }) => {
        const accountData = await z.object({
            address: Address,
        }).parseAsync(event.data);

        const transfer = await step.waitForEvent("wait-for-user-to-select-route", {
            event: "app/transfer.initiate",
            match: "data.address", // the field "data.address" must match
            timeout: "24h", // wait at most 24h
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
            timeout: "5m", // wait at most 5m
        });

        if (!funds_transferred) {
            return await step.sendEvent("app/terminate.account", {
                name: "app/terminate.account",
                data: {
                    address: data.address,
                }
            })
        }

        await step.sendEvent("app/consume.steps", data.routes.map(route => ({
            name: "app/consume.steps",
            data: {
                address: data.address,
                remainingSteps: route.steps,
                id: route.id,
            }
        })))

        const routesWait = data.routes.map(route => step.waitForEvent(`wait-for-route-${route.id}-to-complete`, {
            event: "app/route.completed",
            if: `async.data.id == ${route.id}`,
            timeout: "24h"
        }))
        await Promise.all(routesWait);

        return await step.sendEvent("app/terminate.account", {
            name: "app/terminate.account",
            data: {
                address: data.address,
            }
        })

    });