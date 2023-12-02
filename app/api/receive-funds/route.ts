import { inngest } from "@/lib/inngest/client";
import { createPublicClient, extractChain, http } from 'viem'
import * as chains from 'viem/chains'
import { z } from "zod";

BigInt.prototype.toJSON = function () {
    return this.toString();
};


const Hash = z.string().refine(value => value.startsWith('0x'), {
    message: "Hash/Hex must start with '0x'",
});


export async function POST(request: Request) {
    const body = await request.json();
    const input = z.object({
        transactionHash: Hash,
        chainId: z.number(),
        accountAddress: Hash,
    }).parse(body);

    const client = createPublicClient({
        chain: extractChain({
            chains: Object.values(chains),
            id: input.chainId as any,
        }),
        transport: http()
    })

    const transaction = await client.getTransactionReceipt({
        hash: input.transactionHash as `0x${string}`,
    })

    if (!transaction || transaction.status !== "success") {
        return new Response("Transaction not found", { status: 404 })
    }

    await inngest.send({
        name: "app/funds.transferred",
        data: {
            address: input.accountAddress,
        },
    })

    return new Response(JSON.stringify({
        status: "success",
    }), {
        headers: {
            'Content-Type': 'application/json',
        }
    })
}