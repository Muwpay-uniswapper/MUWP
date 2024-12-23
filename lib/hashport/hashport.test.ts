import { describe, expect, it } from "bun:test";
import { HashportTxData } from "./txData";
import { transactionRequestSchema } from "../inngest/consumeStep";
import { handleHashportRoutes } from "@/app/api/quote/fetchRoutesHashport";
import { zeroAddress } from "viem";

describe("Hashport", () => {
    it("should be able to get quotes", async () => {
        const route = await handleHashportRoutes(
            {
                inputAmount: {
                    "USDC:USD Coin:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48":
                        100000000n,
                },
                fromAddress: "0x492804D7740150378BE8d4bBF8ce012C5497DeA9",
                toAddress: "0.0.1055459",
                inputChain: 1,
                inputTokens: [
                    {
                        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                        value: "USDC:USD Coin:0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
                        image:
                            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
                    },
                ],
                outputChain: 295,
                outputTokens: [
                    {
                        address: "0.0.1055459",
                        value: "USDC[hts]:USD Coin:0.0.1055459",
                        image:
                            "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aptos/assets/0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa%3A%3Aasset%3A%3AUSDC/logo.png",
                    },
                ],
                distribution: [100],
                options: { bridges: { deny: [] }, exchanges: { deny: [] } },
            },
            "0xD34FDA64241a3D3ba71041AC4BbFc188d795BF15",
        );

        expect(route).toBeDefined();

        const r = Object.values(route.routes)[0][0];

        const txData = await HashportTxData(r.steps.at(-1)!);

        console.log(txData);
        expect(txData).toBeDefined();

        const transactionRequest = await transactionRequestSchema.parseAsync(
            txData.transactionRequest,
        );
    });
});