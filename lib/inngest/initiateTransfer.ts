import { inngest } from "./client";
import { z } from "zod";
import * as store from "@/lib/kv/store";
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
    { event: "app/transfer.initiate" },
    async ({ event, step }) => {
        const data = Data.parse(event.data);

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

        await step.sendEvent("app/execute.route", data.routes.map(route => ({
            name: "app/execute.route",
            data: {
                address: data.address,
                route,
            }
        })))
    }
);
