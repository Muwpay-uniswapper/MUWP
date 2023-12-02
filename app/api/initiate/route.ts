import { publicClient } from "@/app/providers";
import { inngest } from "@/lib/inngest/client";
import * as store from "@/lib/kv/store";
import { Route } from "@/lib/li.fi-ts";
import { createPublicClient, createWalletClient, encodeFunctionData, extractChain, fromHex, getContract, http, zeroAddress } from 'viem'
import { HDKey, hdKeyToAccount } from 'viem/accounts'
import { z } from "zod";
import { abi } from "@/out/MUWPTransfer.sol/MUWPTransfer.json"
import erc20 from "@/out/ERC20.sol/ERC20.json";
import * as chains from 'viem/chains'

BigInt.prototype.toJSON = function () {
    return this.toString();
};


export async function POST(request: Request) {
    const body = await request.json();
    const input = z.object({
        from: z.string(),
        chainId: z.number(),
        routes: z.array(Route.zod),
        maxFeePerGas: z.coerce.bigint(),
        maxPriorityFeePerGas: z.coerce.bigint(),
    }).parse(body);

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

    await store.set(account.address, index.toString())


    const totalGas = input.routes.reduce((acc, route) => acc +
        route
            .steps.map(step => step.estimate?.gasCosts?.reduce((acc, gas) => acc + (gas.limit && gas.price ? (BigInt(gas.limit) * BigInt(gas.price)) : BigInt(gas.amount)), 0n) ?? 0n)
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
            account.address,
        ]
    })

    const txn = await client.prepareTransactionRequest({
        account: input.from as `0x${string}`,
        to: process.env.GOERLI_ADDRESS as `0x${string}`,
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
                args: [process.env.GOERLI_ADDRESS as `0x${string}`, args.amount]
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

    await inngest.send({
        name: "app/transfer.initiate",
        data: {
            address: account.address,
            routes: input.routes,
            totalGas,
        },
    })


    return new Response(JSON.stringify({
        status: "success",
        address: account.address,
        txn,
        approvals: approveTransactions,
    }), {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}