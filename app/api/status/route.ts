import { fromHex, toHex } from 'viem'
import { HDKey, hdKeyToAccount } from 'viem/accounts'
import * as store from "@/lib/kv/store";
import { z } from "zod";

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
    const body = await request.text();
    const input = await Address.parseAsync(body);

    const accountInfo = await store.get(input) as string | object | null;
    const completed: [string] | null = typeof accountInfo === "string" ? JSON.parse(accountInfo).completed
        : typeof accountInfo === "object" ? (accountInfo as any).completed
            : null;


    if (!completed) {
        return new Response("Account not found", { status: 404 });
    }

    return new Response(JSON.stringify(completed));
}