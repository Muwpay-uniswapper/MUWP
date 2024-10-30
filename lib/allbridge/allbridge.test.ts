import { handleAllbridgeRoutes } from "@/app/api/quote/fetchRoutesAllBridge";
import { describe, expect, it } from "bun:test";

describe("Allbridge", () => {
    it("should be able to get quotes", async () => {
        const route = await handleAllbridgeRoutes({
            inputChain: 1,
            inputTokens: [{ address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", value: "1:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48" }],
            outputChain: 7,
            outputTokens: [{ address: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75", value: "7:CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75" }],
            options: {},
            toAddress: "GDQ3KSLT5K6Z4LI6UMV3ENQ4865V22TTJYMZXF7U5N6ZKQTZV14OTFOM",
            fromAddress: "0xD34FDA64241a3D3ba71041AC4BbFc188d795BF15",
            inputAmount: {
                "1:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48": BigInt(100)
            },
            distribution: [100, 100]
        }, "0xD34FDA64241a3D3ba71041AC4BbFc188d795BF15")

        console.log(route)
        expect(route).toBeDefined()
    })
});