import { describe, expect, it, vi } from "vitest";
import { RouteService } from "../src/services/RouteService";
import { QuoteResponse } from "../src/types/api";

describe("Stress — concurrent quote requests", () => {
  it("handles 10 concurrent requests and returns ≥ 80% success", async () => {
    const N = 10;

    const http = {
      request: vi.fn().mockResolvedValue({
        routes: {
          "0xfrom": [
            {
              id: "route-1",
              steps: [
                {
                  id: "step-1",
                  type: "SWAP",
                  action: {
                    fromAmount: "1000",
                    fromChainId: 1,
                    fromToken: {
                      address: "0xfrom",
                      chainId: 1,
                      decimals: 18,
                    },
                    toChainId: 7,
                    toToken: {
                      address: "stellar:token",
                      chainId: 7,
                      decimals: 7,
                    },
                  },
                },
              ],
              fromAmount: "1000",
              fromChainId: 1,
              fromToken: { address: "0xfrom", chainId: 1, decimals: 18 },
              toAmount: "900",
              toAmountMin: "880",
              toChainId: 7,
              toToken: { address: "stellar:token", chainId: 7, decimals: 7 },
            },
          ],
        },
        tempAccount: "0xwallet",
        validUntil: Date.now() + 60000,
      } satisfies QuoteResponse),
    } as any;

    const service = new RouteService(http);

    const quoteInput = {
      inputTokens: [{ address: "0xfrom", value: "val" }],
      outputTokens: [{ address: "stellar", value: "stellar" }],
      distribution: [100],
      inputChain: 1,
      outputChain: 7,
      inputAmount: { val: "1000" },
      fromAddress: "0xuser",
    };

    const start = Date.now();

    const results = await Promise.allSettled(
      Array.from({ length: N }, () => service.quote(quoteInput)),
    );

    const elapsed = Date.now() - start;
    const fulfilled = results.filter((r) => r.status === "fulfilled").length;
    const successRate = fulfilled / N;

    console.log(
      `[stress] ${fulfilled}/${N} succeeded in ${elapsed}ms (${Math.round(successRate * 100)}%)`,
    );

    expect(successRate).toBeGreaterThanOrEqual(0.8);
    expect(elapsed).toBeLessThan(10_000);
  });

  it("handles 5 concurrent requests under simulated 200ms latency", async () => {
    const N = 5;

    const http = {
      request: vi.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  routes: { "0xfrom": [] },
                  tempAccount: "0xwallet",
                  validUntil: Date.now() + 60000,
                } satisfies QuoteResponse),
              200,
            ),
          ),
      ),
    } as any;

    const service = new RouteService(http);

    const start = Date.now();

    const results = await Promise.allSettled(
      Array.from({ length: N }, () =>
        service.quote({
          inputTokens: [{ address: "0xfrom", value: "val" }],
          outputTokens: [{ address: "stellar", value: "stellar" }],
          distribution: [100],
          inputChain: 1,
          outputChain: 7,
          inputAmount: { val: "1000" },
          fromAddress: "0xuser",
        }),
      ),
    );

    const elapsed = Date.now() - start;
    const fulfilled = results.filter((r) => r.status === "fulfilled").length;

    console.log(
      `[stress] ${fulfilled}/${N} with 200ms latency completed in ${elapsed}ms`,
    );

    // 5 parallel requests should complete in ~200ms, not 5 × 200ms = 1000ms
    expect(elapsed).toBeLessThan(800);
    expect(fulfilled).toBe(N);
  });
});
