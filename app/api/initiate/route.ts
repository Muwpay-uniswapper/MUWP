import { inngest } from "@/lib/inngest/client";
import { Route } from "@/lib/li.fi-ts";
import { BaseError, createPublicClient, encodeFunctionData, extractChain, http, zeroAddress } from 'viem'
import { z } from "zod";
import MUWPTransfer from "@/out/MUWPTransfer.sol/MUWPTransfer.json"
import * as chains from 'viem/chains'
import { muwpChains } from "@/muwp";
import { EthereumAddress } from "@/lib/core/model/Address";

BigInt.prototype.toJSON = function () {
    return this.toString();
};


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const input = await z.object({
            from: EthereumAddress,
            account: EthereumAddress,
            chainId: z.number(),
            routes: z.array(Route.zod),
            maxFeePerGas: z.coerce.bigint().optional(),
            maxPriorityFeePerGas: z.coerce.bigint().optional(),
        }).parseAsync(body);

        const client = createPublicClient({
            chain: extractChain({
                chains: Object.values(chains),
                id: input.chainId as any,
            }),
            transport: http()
        })

        const totalGas = (await Promise.all(input.routes.map(async route => {
            const stepsCost = await Promise.all(route.steps.map(async step => {
                let gasCost = await step.estimate?.gasCosts?.reduce(async (acc2, gas) => {
                    if (gas.token.address == zeroAddress && gas.token.chainId == input.chainId) {
                        const gasAmount = BigInt(gas.amount ?? "0");

                        // Fetch gas price dynamically
                        const _gasPrice = await client.getGasPrice();
                        const gasPrice = _gasPrice > BigInt(gas.price ?? "0") ? _gasPrice : BigInt(gas.price ?? "0");
                        console.log(`Provided gas price: ${gas.price}, dynamic gas price: ${_gasPrice}, chosen gas price: ${gasPrice}`);
                        const gasLimit = BigInt(gas.limit ?? "0") * gasPrice;

                        // Check if limit * price is bounded by 10 * amount
                        if (gasLimit >= gasAmount && gasLimit <= 10n * gasAmount) {
                            // If it's the case, take the biggest
                            const max = gasLimit > gasAmount ? gasLimit : gasAmount;
                            return (await acc2) + max;
                        } else {
                            return (await acc2) + gasAmount;
                        }
                    } else {
                        return await acc2;
                    }
                }, Promise.resolve(0n)) ?? 0n;

                const feeCost = await step.estimate?.feeCosts?.reduce(async (acc3, fee) => {
                    const feeTotal = (fee.token.address == zeroAddress && fee.token.chainId == input.chainId)
                        ? (BigInt(fee.amount ?? "0"))
                        : 0n;
                    return (await acc3) + feeTotal;
                }, Promise.resolve(0n)) ?? 0n;

                const chain = muwpChains.find(chain => chain.id === step.action.fromToken.chainId)
                const mul: number = typeof chain?.fees?.baseFeeMultiplier == "number" ? chain?.fees?.baseFeeMultiplier : 1.5;

                gasCost = gasCost * BigInt(mul * 1000) / 1000n;
                return 2n * gasCost + feeCost;
            }));

            const routeCost = stepsCost.reduce((acc4, cost) => acc4 + cost, 0n);
            return routeCost;
        }))).reduce((acc1, cost) => acc1 + cost, 0n);

        /*
        function transfer(
        address[] memory tokens,
        uint256[] memory amounts,
        uint256 totalGas,
        address recipient
        ) public payable
            */
        const args = [
            input.routes.map(route => route.steps[0].action.fromToken.address),
            input.routes.map(route => BigInt(route.steps[0].action.fromAmount)),
            totalGas,
            input.account,
        ]
        const data = encodeFunctionData({
            abi: MUWPTransfer.abi,
            functionName: "transfer",
            args
        })


        const chain = muwpChains.find(chain => chain.id === input.chainId)

        const {
            maxFeePerGas,
            maxPriorityFeePerGas
        } = await client.estimateFeesPerGas()

        const txn = await client.prepareTransactionRequest({
            account: input.from as `0x${string}`,
            to: chain?.muwpContract,
            value: totalGas + input.routes.map(route => route.steps[0].action.fromToken.address === zeroAddress ? BigInt(route.steps[0].action.fromAmount) : 0n).reduce((acc, value) => acc + value, 0n),
            data,
            chain: client.chain,
            maxFeePerGas,
            maxPriorityFeePerGas,
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
            const bodyPattern = /Body: "(\{.*\})"/;
            const matches = e.message.match(bodyPattern);

            if (matches && matches.length > 1) {
                const bodyContent = JSON.parse(matches[1].replace(/\\/g, ''));
                return new Response(JSON.stringify({ error: bodyContent.message }), {
                    status: 500
                })
            } else {
                return new Response(JSON.stringify({ error: e.message }), {
                    status: 500
                })
            }
        }
        return new Response(JSON.stringify({ error: "Unexpected error" }), {
            status: 500
        })
    }
}