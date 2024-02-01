import { fromHex } from "viem";
import { HDKey, hdKeyToAccount } from 'viem/accounts'
import { inngest } from "@/lib/inngest/client";
import * as store from "@/lib/kv/store";
import { InputType } from "./route";


export async function generateAccount(input: InputType) {
    const accountInfo = await store.get(input.tempAccount ?? "") as string | object | null;
    const _tempAccount = typeof accountInfo === "string" ? JSON.parse(accountInfo)
        : typeof accountInfo === "object" ? (accountInfo as any)
            : null;

    console.log("Account info retrieved successfully");

    if (!input.tempAccount || typeof input.tempAccount == "undefined" || _tempAccount == null || typeof _tempAccount == "undefined" || _tempAccount.index == null || typeof _tempAccount.index == "undefined") {

        console.log("Account not found, generating new account");

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

        console.log("Account generated successfully");

        await store.set(account.address, JSON.stringify({
            index,
        }));

        console.log("Account stored successfully");

        await inngest.send({
            name: "app/account.created",
            data: {
                address: account.address,
            },
        })

        console.log("Account created event sent successfully");

        return { tempAccount: account.address };
    }
    return { tempAccount: input.tempAccount };
}
