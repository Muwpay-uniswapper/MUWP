import { parseUnits } from "viem";
import { createConfiguration, DefaultApi, AdvancedApi, server1, Step } from "@muwp/lifi-client";
import { LiFi, LifiStep } from '@lifi/sdk'
import { describe, it, expect } from "bun:test";

// Mainnet token addresses (LiFi has no routing liquidity on any testnet)
const USDC  = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"; // USDC  — mainnet
const USDT  = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT  — mainnet
const ETH   = "0x0000000000000000000000000000000000000000"; // ETH   — all chains
const CHAIN = 1; // Ethereum mainnet
const FROM  = "0x27b4A938802b1278317eD0fC0135b6E1E14F43dC";

describe("Li.Fi API", function () {
    const config = createConfiguration({ baseServer: server1 });
    const api = new DefaultApi(config);
    const advancedAPI = new AdvancedApi(config);

    it("Should get a quote", async function () {
        const res = await api.quoteGet("1", "1", "ETH", "USDC", "0x492804d7740150378be8d4bbf8ce012c5497dea9", parseUnits("1", 18).toString());

        expect(res).toBeDefined();
    });

    it("Should fetch tokens", async function () {
        const res = await api.tokensGet("1");

        expect(res.tokens).toBeDefined();
        expect(res.tokens?.length).toBeGreaterThan(0);
    });

    it("Should fetch routes", async function () {
        const routes = await advancedAPI.advancedRoutesPost({
            fromAmount: "100000000000000000", // 0.1 ETH
            fromChainId: CHAIN,
            fromTokenAddress: ETH,
            toChainId: CHAIN,
            toTokenAddress: USDC,
            fromAddress: FROM,
            toAddress: undefined,
        });

        expect(routes).toBeDefined();
        expect(routes.routes?.length).toBeGreaterThan(0);
    });

    it("Should populate steps", async function () {
        const routes = await advancedAPI.advancedRoutesPost({
            fromAmount: "100000000", // 100 USDC
            fromChainId: CHAIN,
            fromTokenAddress: USDC,
            toChainId: CHAIN,
            toTokenAddress: USDT,
            fromAddress: FROM,
            toAddress: undefined,
        });

        const step: Step = routes.routes?.[0].steps?.[0];

        expect(step).toBeDefined();

        const populated = await advancedAPI.advancedStepTransactionPost(step);

        expect(populated).toBeDefined();
        expect(populated.transactionRequest).toBeDefined();
    });

    it("Should handle multiple steps", async function () {
        const [routesA, routesB] = await Promise.all([
            advancedAPI.advancedRoutesPost({
                fromAmount: "100000000", // 100 USDC → USDT
                fromChainId: CHAIN,
                fromTokenAddress: USDC,
                toChainId: CHAIN,
                toTokenAddress: USDT,
                fromAddress: FROM,
                toAddress: undefined,
            }),
            advancedAPI.advancedRoutesPost({
                fromAmount: "100000000000000000", // 0.1 ETH → USDC
                fromChainId: CHAIN,
                fromTokenAddress: ETH,
                toChainId: CHAIN,
                toTokenAddress: USDC,
                fromAddress: FROM,
                toAddress: undefined,
            }),
        ]);

        const step1: Step = routesA.routes?.[0].steps?.[0];
        const step2: Step = routesB.routes?.[0].steps?.[0];

        expect(step1).toBeDefined();
        expect(step2).toBeDefined();

        const [populated1, populated2] = await Promise.all([
            advancedAPI.advancedStepTransactionPost(step1),
            advancedAPI.advancedStepTransactionPost(step2),
        ]);

        expect(populated1.transactionRequest).toBeDefined();
        expect(populated2.transactionRequest).toBeDefined();
    });

    it("Should handle serialized payloads", async function () {
        // Fetch a live route, serialize then re-submit — simulates Inngest step deserialization
        const routes = await advancedAPI.advancedRoutesPost({
            fromAmount: "100000000", // 100 USDC → USDT
            fromChainId: CHAIN,
            fromTokenAddress: USDC,
            toChainId: CHAIN,
            toTokenAddress: USDT,
            fromAddress: FROM,
            toAddress: undefined,
        });

        const step = routes.routes?.[0].steps?.[0];
        expect(step).toBeDefined();

        // Round-trip through JSON serialization, as the Inngest handler does
        const serialized = JSON.parse(JSON.stringify(step)) as LifiStep;

        const lifi = new LiFi({ integrator: 'MUWP', apiUrl: 'https://li.quest/v1' });
        const tx = await lifi.getStepTransaction(serialized);

        expect(tx).toBeDefined();
        expect(tx.transactionRequest).toBeDefined();
    });
});
