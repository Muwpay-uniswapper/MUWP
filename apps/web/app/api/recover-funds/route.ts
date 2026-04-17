import { fromHex, toHex, verifyMessage } from 'viem'
import { HDKey, hdKeyToAccount } from 'viem/accounts'
import * as store from "@/lib/kv/store";
import { EthereumAddress } from '@/lib/core/model/Address';
import { z } from 'zod';


export async function POST(request: Request) {
    const body = await request.json();
    const input = await z.object({
        id: EthereumAddress,
        signature: z.string(),
        address: EthereumAddress,
    }).parseAsync(body);

    const valid = await verifyMessage({
        address: input.address as `0x${string}`,
        message: input.id,
        signature: input.signature as `0x${string}`,
    })

    if (!valid) {
        return new Response("Invalid signature", { status: 400 });
    }

    const accountInfo = await store.get(input.id) as string | object | null;
    const info = typeof accountInfo === "string" ? JSON.parse(accountInfo)
        : typeof accountInfo === "object" ? (accountInfo as any)
            : null;

    if ((info?.from && info.from !== input.address) || (info?.to && info.to !== input.address)) {
        return new Response("Account not yours", { status: 404 });
    }

    const index = info?.index;

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