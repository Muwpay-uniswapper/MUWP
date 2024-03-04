import { inngest } from "./client";
import { z } from "zod";
import * as store from "@/lib/kv/store";
import { EthereumAddress } from "../core/model/Address";

const portfolioSchema = z.object({
    links: z.object({
        self: z.string().url(),
    }),
    data: z.object({
        type: z.string(),
        id: z.string(),
        attributes: z.object({
            total: z.object({
                positions: z.number(),
            }),
        }),
    }),
});

export const terminateAccount = inngest.createFunction(
    { id: "terminate-account" },
    { event: "app/terminate.account" },
    async ({ event, step }) => {
        const data = await z.object({
            address: EthereumAddress,
        }).parseAsync(event.data);

        await step.run("verify-account-funds", async () => {
            const options = {
                method: 'GET',
                headers: {
                    accept: 'application/json',
                    authorization: `Basic ${btoa(process.env.ZERION_API_KEY as string + ':')}`,
                }
            };

            const res = await fetch(`https://api.zerion.io/v1/wallets/${data.address}/portfolio?currency=usd`, options)
                .then(response => response.json())
            const portfolio = portfolioSchema.parse(res);

            const balance = portfolio.data.attributes.total.positions;

            if (balance > 5) {
                throw new Error("Account has more than 5 USD");
            }

            return balance;
        });

        await step.run("should-close-account", async () => {
            await store.del(data.address);
        })
    }
);
