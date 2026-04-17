import { describe, expect, it, vi } from "vitest";
import { WalletService } from "../src/services/WalletService";
import { RouteService } from "../src/services/RouteService";
import { Route } from "../src/types/routes";

const mockRoute: Route = {
  id: "route-1",
  steps: [],
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
    address: "stellar",
    chainId: 7,
    decimals: 7,
  },
};

describe("WalletService", () => {
  it("caches temp accounts and builds initiate payloads", async () => {
    const routeService = {
      quote: vi.fn().mockResolvedValue({
        routes: { "0xfrom": [mockRoute] },
        tempAccount: "0xwallet",
        validUntil: Date.now() + 1000,
      }),
      buildSenderMatrix: vi.fn().mockReturnValue({
        "0xfrom": { "0xgas": "1000" },
      }),
    } as unknown as RouteService;

    const wallets = new WalletService(routeService);
    const quote = await wallets.requestManagedWallet({
      inputTokens: [{ address: "0xfrom", value: "val" }],
      outputTokens: [{ address: "stellar", value: "stellar" }],
      distribution: [100],
      inputChain: 1,
      outputChain: 7,
      inputAmount: { val: "1000" },
      fromAddress: "0xuser",
    });

    expect(quote.tempAccount).toBe("0xwallet");
    const payload = wallets.buildInitiatePayload({
      routes: [mockRoute],
      account: quote.tempAccount,
      gasPayer: "0xgas",
      chainId: 1,
    });
    expect(payload.from["0xfrom"]["0xgas"]).toBe("1000");
  });
});

