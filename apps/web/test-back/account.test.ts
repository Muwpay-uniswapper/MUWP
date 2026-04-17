import { HDKey, hdKeyToAccount } from 'viem/accounts'
import { fromHex } from "viem";
import { describe, it, expect } from "bun:test";

describe("HD Wallet", function () {
    it("Should generate a consistent wallet", async function () {
        // const privateKey = secp256k1.utils.randomPrivateKey()
        const privateKey = new Uint8Array([166, 61, 111, 154, 173, 169, 54, 1, 200, 83, 16, 218, 182, 75, 241, 138, 223, 240, 253, 49, 165, 125, 223, 26, 46, 207, 124, 64, 212, 206, 187, 139])
        const hdKey = HDKey.fromMasterSeed(privateKey)
        const account = hdKeyToAccount(hdKey, {
            accountIndex: 0,
        })

        expect(account.address).toEqual("0xE05f5dE81F34C461B3fe7e135B8314eACfCA3F3a")
    });

    it("Should generate a consistent wallet from env", async function () {
        const master_hd = process.env.MASTER_HD?.trim() as `0x${string}`
        const privateKey = fromHex(master_hd, "bytes")
        const hdKey = HDKey.fromMasterSeed(privateKey)
        const account = hdKeyToAccount(hdKey, {
            accountIndex: 0,
        })

        expect(account.address).toEqual("0xB4460e9c543a62e9C8EBb13BF6805BEC11A739A3")
    })
});