import { inngest } from "@/lib/inngest/client";
import * as store from "@/lib/kv/store";
import { Route } from "@/lib/li.fi-ts";
import { createWalletClient, fromHex, http } from 'viem'
import { HDKey, hdKeyToAccount, generatePrivateKey } from 'viem/accounts'
import { z } from "zod";

BigInt.prototype.toJSON = function () {
    return this.toString();
};


export async function POST(request: Request) {
    const body = await request.json();
    const input = z.array(Route.zod).parse(body);

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

    await inngest.send({
        name: "app/transfer.initiate",
        data: {
            address: account.address,
            routes: input,
        },
    })

    return new Response(account.address);
}