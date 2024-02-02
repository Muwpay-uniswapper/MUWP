import { describe, expect, it } from "bun:test";
import { createPublicClient, encodePacked, getContract, http, zeroAddress } from 'viem'
import { OmnichainAptosBridge } from "./omnichains";
import { OmnichainAptosBridgeAbi } from "./abi";
import { mainnet } from 'viem/chains'

describe("Aptos", () => {
    const client = createPublicClient({
        chain: mainnet,
        transport: http()
    })

    it("should be able to get quotes", async () => {
        // 1. Create contract instance
        const contract = getContract({
            address: OmnichainAptosBridge.ethereum,
            abi: OmnichainAptosBridgeAbi,
            // 1a. Insert a single client
            publicClient: client,
        })

        // 2. Call contract methods, fetch events, listen to events, etc.
        const adapterParams = encodePacked(
            ["uint16", "uint256", "uint256", "bytes"], // [txType  extraGas  airdropAmt  airdropAddress]
            [2, 5000n, 1000000n, "0xD34FDA64241a3D3ba71041AC4BbFc188d795BF15"]
        )
        const [nativeFee, zroFee] = await contract.read.quoteForSend([{
            refundAddress: "0xD34FDA64241a3D3ba71041AC4BbFc188d795BF15",
            zroPaymentAddress: zeroAddress,
        }, adapterParams])
        console.log(nativeFee, zroFee)
        expect(nativeFee).toBeGreaterThan(0n)
        expect(zroFee).toBeDefined()
    })
});