import api, { advancedAPI } from "@/lib/front/data/api";
import { GasSuggestionResponse, Route, RouteOptions } from "@/lib/li.fi-ts";
import { z } from 'zod';
import { HDKey, hdKeyToAccount } from 'viem/accounts'
import { fromHex } from "viem";
import * as store from "@/lib/kv/store";
import { inngest } from "@/lib/inngest/client";

const Address = z
    .string()
    .refine(value =>
        /^(0x)?[0-9a-fA-F]{40}$/.test(value),
        {
            message: 'Invalid Ethereum address.',
            path: [], // path is kept empty to indicate whole string should be validated
        }
    );

const Token = z.object({
    address: Address,
    value: z.string(),
});

const Input = z.object({
    inputTokens: z.array(Token).min(1),
    outputToken: Token,
    inputChain: z.number(),
    outputChain: z.number(),
    inputAmount: z.record(z.coerce.bigint()),
    fromAddress: Address,
    tempAccount: Address.optional(),
    toAddress: Address.optional(),
    options: RouteOptions.zod.optional(),
});

// Export Input type for use in other files
export type InputType = z.infer<typeof Input>;

BigInt.prototype.toJSON = function () {
    return this.toString();
};

export async function POST(request: Request) {
    try {
        // Parse the incoming request body as JSON data
        const body = await request.json();
        const input = await Input.parseAsync(body);

        console.log("Input parsed successfully");

        const accountInfo = await store.get(input.tempAccount ?? "") as string | object | null;
        const _tempAccount = typeof accountInfo === "string" ? JSON.parse(accountInfo)
            : typeof accountInfo === "object" ? (accountInfo as any)
                : null;

        console.log("Account info retrieved successfully");

        if (!input.tempAccount || typeof input.tempAccount == "undefined" || _tempAccount == null || typeof _tempAccount == "undefined" || _tempAccount.index == null || typeof _tempAccount.index == "undefined") {

            console.log("Account not found, generating new account");

            const master_hd = process.env.MASTER_HD?.trim() as `0x${string}`
            const privateKey = fromHex(master_hd, "bytes")
            const hdKey = HDKey.fromMasterSeed(privateKey)

            // Generate random index using crypto module
            const bytes = new Uint32Array(1)
            crypto.getRandomValues(bytes)

            const index = bytes[0] % 0x80000000; // Max offset

            const account = hdKeyToAccount(hdKey, {
                accountIndex: index,
            })

            console.log("Account generated successfully");

            await store.set(account.address, JSON.stringify({
                index,
            }));

            console.log("Account stored successfully");

            await inngest.send({
                name: "app/account.created",
                data: {
                    address: account.address,
                },
            })

            console.log("Account created event sent successfully");

            input.tempAccount = account.address;
        }

        console.log("Fetching routes");

        const queries = input.inputTokens.map(async inToken => {
            let fromAmountForGas: string | undefined = undefined;
            let gas: GasSuggestionResponse | undefined = undefined;
            if (input.inputChain !== input.outputChain) {
                gas = await api.gasSuggestionChainGet(input.outputChain.toString())
                fromAmountForGas = gas?.recommended?.amount
            }
            let routes = await advancedAPI.advancedRoutesPost({
                fromAmount: input.inputAmount[inToken.value]?.toString(),
                fromChainId: input.inputChain,
                fromTokenAddress: inToken.address,
                toChainId: input.outputChain,
                toTokenAddress: input.outputToken.address,
                fromAddress: input.tempAccount,
                toAddress: input.toAddress ?? input.fromAddress,
                fromAmountForGas,
                options: input.options,
            });
            if (gas && gas.available === false) {
                // Filter routes that (1) contains more than 1 chain change, (2) contains more than 1 step after the first chain change
                routes.routes = routes.routes.filter(route => {
                    const chainChanges = route.steps.filter(step => step.action.fromChainId !== step.action.toChainId);
                    if (chainChanges.length > 1) {
                        return false;
                    }
                    const stepsAfterChainChange = route.steps.slice(chainChanges[0] ? route.steps.indexOf(chainChanges[0]) + 1 : 0);
                    if (stepsAfterChainChange.length > 0) {
                        return false;
                    }
                    return true;
                });
            }
            return routes;
        })

        const rawRoutes = await Promise.all(queries); // Fetch all routes in parallel

        console.log("Routes fetched successfully");

        const routes: {
            [key: string]: Route[]
        } = {};

        for (let index = 0; index < rawRoutes.length; index++) {
            const rawRoute = rawRoutes[index];
            const _routes = rawRoute.routes;
            if (!_routes || typeof rawRoute.routes[0].fromAddress == "undefined") {
                console.log(JSON.stringify(rawRoute.unavailableRoutes?.filteredOut, null, 2));
                throw new Error(`No route found for ${input.inputTokens[index].value} -> ${input.outputToken.value}`);
            }
            const key = rawRoute.routes[0].fromToken.address;
            routes[key] = _routes;
        }


        return new Response(JSON.stringify({
            routes,
            tempAccount: input.tempAccount,
            validUntil: Date.now() + 1000 * 60 * 5, // 5 minutes
        }), {
            headers: { 'content-type': 'application/json' },
        });
    } catch (e) {
        if (e instanceof Error) {
            console.log(e.message)
            const bodyPattern = /Body: \"(\{.*\})\"/;
            const matches = e.message.match(bodyPattern);

            if (matches && matches.length > 1) {
                const bodyContent = JSON.parse(matches[1].replace(/\\/g, ''));
                return new Response(JSON.stringify({ message: bodyContent.message }), {
                    status: 500
                })
            }
        }
        return new Response(JSON.stringify({ message: "Unexpected error" }), {
            status: 500
        })
    }
}
