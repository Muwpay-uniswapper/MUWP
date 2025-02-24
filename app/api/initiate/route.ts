import { inngest } from "@/lib/inngest/client";
import { BaseError, createPublicClient, encodeFunctionData, extractChain, http, zeroAddress, keccak256, encodePacked, Address, hexToBytes, toHex } from 'viem'
import { z } from "zod";
import MUWPTransfer from "@/out/MUWPTransfer.sol/MUWPTransfer.json"
import * as chains from 'viem/chains'
import { muwpChains } from "@/muwp";
import { InitiateResponse, StrictInputInitiate } from "./types";
import * as store from "@/lib/kv/store"
import { secp256k1 } from '@noble/curves/secp256k1';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const input = await StrictInputInitiate.parseAsync(body);

        const client = createPublicClient({
            chain: extractChain({
                chains: Object.values(chains),
                id: input.chainId as any,
            }),
            transport: http()
        })

        const _totalGas = (await Promise.all(input.routes.map(async route => {
            const stepsCost = await Promise.all(route.steps.map(async step => {
                let gasCost = await step.estimate?.gasCosts?.reduce(async (acc2, gas) => {
                    if (gas.token.address == zeroAddress && gas.token.chainId == input.chainId) {
                        const gasAmount = BigInt(gas.amount ?? "0");

                        // Fetch gas price dynamically
                        const _gasPrice = await client.getGasPrice();
                        let gasPrice: bigint;

                        try {
                            gasPrice = BigInt(gas.price ?? "0");
                            gasPrice = _gasPrice > gasPrice ? _gasPrice : gasPrice;
                        } catch {
                            gasPrice = 1n; // Use _gasPrice if conversion fails
                        }

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

                console.log("gasCost", gasCost)

                const feeCost = await step.estimate?.feeCosts?.reduce(async (acc3, fee) => {
                    const feeTotal = (fee.token.address == zeroAddress && fee.token.chainId == input.chainId)
                        ? (BigInt(fee.amount ?? "0"))
                        : 0n;
                    return (await acc3) + feeTotal;
                }, Promise.resolve(0n)) ?? 0n;

                console.log("feeCost", feeCost)

                const chain = muwpChains.find(chain => chain.id === step.action.fromToken.chainId)
                const mul: number = typeof chain?.fees?.baseFeeMultiplier == "number" ? chain?.fees?.baseFeeMultiplier : 1.5;

                console.log("mul", mul);

                gasCost = gasCost * BigInt(mul * 1000) / 1000n;
                return 2n * gasCost + feeCost;
            }));

            const routeCost = stepsCost.reduce((acc4, cost) => acc4 + cost, 0n);
            return routeCost;
        })))

        const totalGas = BigInt(_totalGas.reduce((acc1, cost) => acc1 + cost, 0n));

        // Verify the account exists in our database
        const accountInfo = await store.get(input.account) as string | object | null
        const storedAccount = typeof accountInfo === "string" ? JSON.parse(accountInfo)
            : typeof accountInfo === "object" ? (accountInfo as any)
                : null

        if (!storedAccount || typeof storedAccount.index === "undefined") {
            throw new Error("Invalid account: not generated through our system")
        }

        // Continue with signature generation
        const signerPrivateKey = process.env.MUWP_SIGNER_KEY
        if (!signerPrivateKey) {
            throw new Error("MUWP_SIGNER_KEY environment variable is not set")
        }

        const messageHash = keccak256(
            encodePacked(
                ['address'],
                [input.account as Address]
            )
        )

        const priv = hexToBytes(signerPrivateKey as `0x${string}`);
        const msg = hexToBytes(messageHash);
        const signature = secp256k1.sign(msg, priv); // `{prehash: true}` option is available

        console.log("messageHash", messageHash);

        const v = signature.recovery + 27; // 27 is the offset for the y-parity
        console.log("v", v);
        const s = signature.s;
        console.log("s", s);
        const r = signature.r;
        console.log("r", r);

        const hex = encodePacked(
            ['bytes32', 'bytes32', 'uint8'],
            [toHex(r, { size: 32 }), toHex(s, { size: 32 }), v]
        )

        /*
        // For Gas Payer
        function transfer(
            address[] calldata senders,
            address[] calldata tokens,
            uint256[] calldata amounts,
            uint256 totalGas,
            address recipient,
            bytes memory signature
        ) public payable
            */
        const args = [
            input.routes.map(route => Object.keys(input.from[route.fromToken.address])).flat(),
            input.routes.map(route => route.fromToken.address),
            input.routes.map(route => Object.values(input.from[route.fromToken.address])).flat(),
            totalGas,
            input.account,
            hex
        ]
        console.log("args", args)
        const data = encodeFunctionData({
            abi: MUWPTransfer.abi,
            functionName: "transfer",
            args
        })


        const chain = muwpChains.find(chain => chain.id === input.chainId)

        console.log("totalGas", _totalGas)
        console.log("input.routes", input.routes.map(route => route.steps[0].action.fromToken.address === zeroAddress ? BigInt(route.steps[0].action.fromAmount) : 0n).reduce((acc, value) => acc + value, 0n))
        const txn = await client.prepareTransactionRequest({
            account: input.gasPayer as `0x${string}`,
            to: chain?.muwpContract,
            value: totalGas + input.routes.map(route => route.steps[0].action.fromToken.address === zeroAddress ? BigInt(route.steps[0].action.fromAmount) : 0n).reduce((acc, value) => acc + value, 0n),
            data,
            chain: client.chain,
            type: "legacy"
        })

        const _id = await inngest.send({
            name: "app/transfer.initiate",
            data: {
                address: input.account,
                routes: input.routes,
                totalGas,
                refundAddress: input.gasPayer,
            },
        })

        return new Response(JSON.stringify({
            status: "success",
            address: input.account,
            txn,
            id: _id.ids[0]
        } as z.infer<typeof InitiateResponse>), {
            headers: {
                'Content-Type': 'application/json',
            }
        })
    } catch (e) {
        console.error(e);
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