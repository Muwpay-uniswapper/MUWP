import { inngest } from "@/lib/inngest/client";
import { Route } from "@/lib/li.fi-ts";
import { createPublicClient, encodeFunctionData, extractChain, http, zeroAddress } from 'viem'
import { z } from "zod";
import { abi } from "@/out/MUWPTransfer.sol/MUWPTransfer.json"
import erc20 from "@/out/ERC20.sol/ERC20.json";
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
    const body = await request.json();
    const input = await z.object({
        from: Address,
        account: Address,
        chainId: z.number(),
        routes: z.array(Route.zod),
        maxFeePerGas: z.coerce.bigint(),
        maxPriorityFeePerGas: z.coerce.bigint(),
    }).parseAsync(body);

    const totalGas = input.routes.reduce((acc, route) => acc +
        route
            .steps.map(step => {
                const gas = step.estimate?.gasCosts?.reduce((acc, gas) => acc + (gas.limit && gas.price ? (BigInt(gas.limit) * BigInt(gas.price)) : BigInt(gas.amount)), 0n) ?? 0n

                const fees = step.estimate?.feeCosts?.reduce((acc, fee) => acc + (fee.token.address == zeroAddress ? BigInt(fee.amount ?? "0") : 0n), 0n) ?? 0n
                return gas + fees
            })
            .reduce((acc, gas) => acc + gas, 0n)
        , 0n)

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

    // Prepare `approve()` calls for all tokens that need approval (omit those who don't)
    const approveArgsList = input.routes
        .filter(route => route.steps[0].action.fromToken.address !== zeroAddress)
        .map(route => ({
            tokenAddress: route.steps[0].action.fromToken.address as `0x${string}`,
            amount: BigInt(route.steps[0].action.fromAmount)
        }));

    // Promise all approve transactions
    const approveTransactions = await Promise.all(
        approveArgsList.map(args => {
            const approveData = encodeFunctionData({
                abi: erc20.abi, // Use ERC20 abi
                functionName: "approve",
                args: [chain?.muwpContract, args.amount]
            });

            return client.prepareTransactionRequest({
                account: input.from as `0x${string}`,
                to: args.tokenAddress,
                value: 0n, // approval function does not require ether,
                data: approveData,
                chain: client.chain,
                maxFeePerGas: input.maxFeePerGas,
                maxPriorityFeePerGas: input.maxPriorityFeePerGas,
            });
        })
    );

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
        id: _id.ids[0],
        approvals: approveTransactions,
    }), {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}