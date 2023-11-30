import { publicClient } from "@/app/providers";
import { inngest } from "@/lib/inngest/client";
import * as store from "@/lib/kv/store";
import { Route } from "@/lib/li.fi-ts";
import { createWalletClient, fromHex, TransactionReceipt } from 'viem'
import { HDKey, hdKeyToAccount, generatePrivateKey } from 'viem/accounts'
import { z } from "zod";

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
const Hash = z.string().refine(value => value.startsWith('0x'), {
    message: "Hash/Hex must start with '0x'",
});


export async function POST(request: Request) {
    const body = await request.json();
    const input = z.object({
        transactionHash: Hash,
        chainId: z.number(),
    }).parse(body);

    const transaction = await publicClient({ chainId: input.chainId }).getTransactionReceipt({
        hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d'
    })

    if (!transaction || transaction.status !== "success") {
        return new Response("Transaction not found", { status: 404 })
    }

    await inngest.send({
        name: "app/funds.transferred",
        data: {
            address: transaction.from,
        },
    })

    return new Response(JSON.stringify({
        status: "success",
    }), {
        headers: {
            'Content-Type': 'application/json',
        })
}