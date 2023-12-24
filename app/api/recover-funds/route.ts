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
    const index = typeof accountInfo === "string" ? JSON.parse(accountInfo).index
        : typeof accountInfo === "object" ? (accountInfo as any).index
            : null;


    if (!index) {
        return new Response("Account not found", { status: 404 });
    }

    const master_hd = process.env.MASTER_HD?.trim() as `0x${string}`
    const privateKey = fromHex(master_hd, "bytes")
    const hdKey = HDKey.fromMasterSeed(privateKey)

    const account = hdKeyToAccount(hdKey, {
        accountIndex: parseInt(index),
    })

    const pk = toHex(account.getHdKey().privateKey!)

    return new Response(pk);
}