import { describe, expect, it } from "bun:test";
import { createPublicClient, decodeAbiParameters, encodePacked, getContract, http, zeroAddress } from 'viem'
import { AptosChains, OmnichainAptosBridge } from "./omnichains";
import { OmnichainAptosBridgeAbi } from "./abi";
import { avalanche, mainnet } from 'viem/chains'

describe("Aptos", () => {
    const client = createPublicClient({
        chain: avalanche,
        transport: http()
    })

    it("should be able to get quotes", async () => {
        // 1. Create contract instance
        const contract = getContract({
            address: OmnichainAptosBridge[AptosChains.avalanche] as `0x${string}`,
            abi: OmnichainAptosBridgeAbi,
            // 1a. Insert a single client
            publicClient: client,
        })

        const aptosGas = await fetch("https://mainnet.aptoslabs.com/v1/estimate_gas_price").then((res) => res.json());
        const gasUnits = 1301n;
        const estimate = gasUnits * BigInt(aptosGas.gas_estimate) * 4n;

        console.log(`Aptos gas: ${estimate}`);

        // 2. Call contract methods, fetch events, listen to events, etc.
        const adapterParams = encodePacked(
            ["uint16", "uint256", "uint256", "bytes"], // [txType  extraGas  airdropAmt  airdropAddress]
            [
                2,
                10000n,
                520400n,
                "0xedd16b36f2c2a61aced8e42045ce37fa0bf444604577e05b2d0918c7ec9f1744" // Aptos address to receive gas
            ]
        )


        const hexStr = "00020000000000000000000000000000000000000000000000000000000000002710000000000000000000000000000000000000000000000000000000000007f0d0edd16b36f2c2a61aced8e42045ce37fa0bf444604577e05b2d0918c7ec9f1744";
        const uint16Data = hexStr.slice(0, 4);
        const uint256Data_1 = hexStr.slice(4, 68);
        const uint256Data_2 = hexStr.slice(68, 132);
        const bytesData = hexStr.slice(132);

        function hexToUint16(hex: string) {
            return parseInt(hex, 16);
        }

        function hexToUint256(hex: string) {
            return BigInt("0x" + hex);
        }

        const dataUnit16 = hexToUint16(uint16Data);
        const dataUint256_1 = hexToUint256(uint256Data_1);
        const dataUint256_2 = hexToUint256(uint256Data_2);

        console.log(`Uint16: ${dataUnit16}`);
        console.log(`Uint256_1: ${dataUint256_1}`);
        console.log(`Uint256_2: ${dataUint256_2}`);
        console.log(`Bytes: ${bytesData}`);

        const [nativeFee, zroFee] = await contract.read.quoteForSend([{
            refundAddress: "0xD34FDA64241a3D3ba71041AC4BbFc188d795BF15",
            zroPaymentAddress: zeroAddress,
        }, adapterParams])
        console.log(nativeFee, zroFee)
        expect(nativeFee).toBeGreaterThan(0n)
        expect(zroFee).toBeDefined()
    })
});