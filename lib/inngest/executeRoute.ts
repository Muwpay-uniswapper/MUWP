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
});

export const executeRoute = inngest.createFunction(
    { id: "execute-route" },
    { event: "app/transfer.initiate" },
    async ({ event, step }) => {
        const data = Data.parse(event.data);

        const funds_transferred = await step.waitForEvent("wait-for-user-to-transfer-funds", {
            event: "app/funds.transferred",
            match: "data.address", // the field "data.address" must match
            timeout: "24h", // wait at most 24 hours
        });

        if (!funds_transferred) {
            await step.run("should-close-account", async () => {
                await store.del(data.address);
            })
        }
    },
);
