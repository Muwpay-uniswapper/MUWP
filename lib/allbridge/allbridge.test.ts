import { handleAllbridgeRoutes } from "@/app/api/quote/fetchRoutesAllBridge";
import { describe, expect, it } from "bun:test";
import { zeroAddress } from "viem";
import { AllBridgeTxData } from "./txData";

describe("Allbridge", () => {
    it("should be able to get quotes", async () => {
        const route = await handleAllbridgeRoutes(
            {
                inputAmount: {
                    "POL:Polygon Ecosystem Token:0x0000000000000000000000000000000000000000":
                        1000000000000000000n,
                },
                fromAddress: "0x492804D7740150378BE8d4bBF8ce012C5497DeA9",
                toAddress: "GBHOLCU2LBVUGCISBDN4AJ5SX4FKFZ7JJZYKEDGHUSC6IOCZGDP5GDEJ",
                inputChain: 137,
                inputTokens: [
                    {
                        address: "0x0000000000000000000000000000000000000000",
                        value:
                            "POL:Polygon Ecosystem Token:0x0000000000000000000000000000000000000000",
                        image:
                            "https://static.debank.com/image/matic_token/logo_url/matic/6f5a6b6f0732a7a235131bd7804d357c.png",
                    },
                ],
                outputChain: 7,
                outputTokens: [
                    {
                        address: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
                        value:
                            "USDC:USD Coin:CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
                        image:
                            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aptos/assets/0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa%3A%3Aasset%3A%3AUSDC/logo.png",
                    },
                ],
                distribution: [100],
                options: { bridges: { deny: [] }, exchanges: { deny: [] } },
            },
            "0xD34FDA64241a3D3ba71041AC4BbFc188d795BF15",
        );

        console.log(route);
        expect(route).toBeDefined();

        const r = route.routes[zeroAddress][0];

        const txData = await AllBridgeTxData(r.steps.at(-1)!);

        console.log(txData);
        expect(txData).toBeDefined();
    });
});
