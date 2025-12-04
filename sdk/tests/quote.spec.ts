import { describe, expect, it, vi } from "vitest";
import { RouteService } from "../src/services/RouteService";
import { QuoteResponse } from "../src/types/api";
import { Route } from "../src/types/routes";

const baseRoute: Route = {
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
  fromToken: {
    address: "0xfrom",
    chainId: 1,
    decimals: 18,
  },
  toAmount: "900",
  toAmountMin: "880",
  toChainId: 7,
  toToken: {
    address: "stellar:token",
    chainId: 7,
    decimals: 7,
  },
};

describe("RouteService", () => {
  it("selects preferred routes", async () => {
    const http = {
      request: vi.fn().mockResolvedValue({
        routes: { "0xfrom": [{ ...baseRoute, tags: ["RECOMMENDED"], toAmountUSD: "900" }] },
        tempAccount: "0xwallet",
        validUntil: Date.now() + 60000,
      } satisfies QuoteResponse),
    } as any;
    const service = new RouteService(http);
    const quote = await service.quote({
      inputTokens: [{ address: "0xfrom", value: "val" }],
      outputTokens: [{ address: "stellar", value: "stellar" }],
      distribution: [100],
      inputChain: 1,
      outputChain: 7,
      inputAmount: { val: "1000" },
      fromAddress: "0xuser",
    });
    expect(quote.tempAccount).toBe("0xwallet");
    const selected = service.selectRoutes(quote.routes, { maxRoutes: 1 });
    expect(selected[0].tags).toContain("RECOMMENDED");
  });
});

