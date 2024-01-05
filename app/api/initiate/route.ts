import { inngest } from "@/lib/inngest/client";
import { Route } from "@/lib/li.fi-ts";
import { BaseError, createPublicClient, encodeFunctionData, extractChain, http, zeroAddress } from 'viem'
import { z } from "zod";
import { abi } from "@/out/MUWPTransfer.sol/MUWPTransfer.json"
import * as chains from 'viem/chains'
import { muwpChains } from "@/muwp";

BigInt.prototype.toJSON = function () {
    return this.toString();
};

const Address = z
    .string()
    .refine(value =>
        /^(0x)?[0-9a-fA-F]{40}$/.test(value),
        {
            message: 'Invalid Ethereum address.',
            path: [], // path is kept empty to indicate whole string should be validated
        }
    );


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const input = await z.object({
            from: Address,
            account: Address,
            chainId: z.number(),
            routes: z.array(Route.zod),
            maxFeePerGas: z.coerce.bigint().optional(),
            maxPriorityFeePerGas: z.coerce.bigint().optional(),
        }).parseAsync(body);

        const totalGas = input.routes.reduce((acc1, route) => {
            const stepsCost = route.steps.map(step => {

                const gasCost = step.estimate?.gasCosts?.reduce((acc2, gas) => {
                    const gasTotal = (gas.token.address == zeroAddress && gas.token.chainId == input.chainId)
                        ? ((BigInt(gas.amount ?? "0") * 12n) / 10n)
                        : 0n;
                    return acc2 + gasTotal;
                }, 0n) ?? 0n;

                const feeCost = step.estimate?.feeCosts?.reduce((acc3, fee) => {
                    const feeTotal = (fee.token.address == zeroAddress && fee.token.chainId == input.chainId)
                        ? (BigInt(fee.amount ?? "0"))
                        : 0n;
                    return acc3 + feeTotal;
                }, 0n) ?? 0n;

                return gasCost + feeCost;
            });

            const routeCost = stepsCost.reduce((acc4, cost) => acc4 + cost, 0n);
            return acc1 + routeCost;
        }, 0n);

        const client = createPublicClient({
            chain: extractChain({
                chains: Object.values(chains),
                id: input.chainId as any,
            }),
            transport: http()
        })
        /*
        function transfer(
        address[] memory tokens,
        uint256[] memory amounts,
        uint256 totalGas,
        address recipient
        ) public payable
            */
        const data = encodeFunctionData({
            abi,
            functionName: "transfer",
            args: [
                input.routes.map(route => route.steps[0].action.fromToken.address),
                input.routes.map(route => BigInt(route.steps[0].action.fromAmount)),
                totalGas,
                input.account,
            ]
        })

        const chain = muwpChains.find(chain => chain.id === input.chainId)

        const txn = await client.prepareTransactionRequest({
            account: input.from as `0x${string}`,
            to: chain?.muwpContract,
            value: totalGas + input.routes.map(route => route.steps[0].action.fromToken.address === zeroAddress ? BigInt(route.steps[0].action.fromAmount) : 0n).reduce((acc, value) => acc + value, 0n),
            data,
            chain: client.chain,
            maxFeePerGas: input.maxFeePerGas,
            maxPriorityFeePerGas: input.maxPriorityFeePerGas,
        })

        const _id = await inngest.send({
            name: "app/transfer.initiate",
            data: {
                address: input.account,
                routes: input.routes,
                totalGas,
            },
        })


        return new Response(JSON.stringify({
            status: "success",
            address: input.account,
            txn,
            id: _id.ids[0]
        }), {
            headers: {
                'Content-Type': 'application/json',
            }
        })
    } catch (e) {
        if (e instanceof z.ZodError) {
            return new Response(JSON.stringify({
                status: "error",
                error: e.errors,
            }), {
                headers: {
                    'Content-Type': 'application/json',
                },
                status: 500
            })
        } else if (e instanceof BaseError) {
            return new Response(JSON.stringify({
                status: "error",
                error: e.message,
            }), {
                headers: {
                    'Content-Type': 'application/json',
                },
                status: 500
            })
        } else if (e instanceof Error) {
            console.log(e.message)
            const bodyPattern = /Body: \"(\{.*\})\"/;
            const matches = e.message.match(bodyPattern);

            if (matches && matches.length > 1) {
                const bodyContent = JSON.parse(matches[1].replace(/\\/g, ''));
                return new Response(JSON.stringify({ message: bodyContent.message }), {
                    status: 500
                })
            } else {
                return new Response(JSON.stringify({ message: e.message }), {
                    status: 500
                })
            }
        }
        return new Response(JSON.stringify({ message: "Unexpected error" }), {
            status: 500
        })
    }
}