import { describe, expect, it, vi } from "vitest";
import { SwapService } from "../src/services/SwapService";
import { Route } from "../src/types/routes";

const demoRoute: Route = {
  id: "r-1",
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
  toAmount: "950",
  toAmountMin: "930",
  toChainId: 7,
  toToken: {
    address: "stellar:token",
    chainId: 7,
    decimals: 7,
  },
};

describe("SwapService", () => {
  it("runs multi-token prototype", async () => {
    const routeService = {
      selectRoutes: vi.fn(),
      initiate: vi.fn().mockResolvedValue({
        status: "success",
        address: "0xwallet",
        txn: { to: "0xcontract" },
        id: "id-1",
      }),
      notifyReceiveFunds: vi.fn().mockResolvedValue({ status: "ok" }),
      notifyChainConfirmed: vi.fn().mockResolvedValue({ status: "ok" }),
    } as any;

    const walletService = {
      buildInitiatePayload: vi.fn().mockReturnValue({
        from: { "0xfrom": { "0xuser": "1000" } },
        gasPayer: "0xuser",
        account: "0xwallet",
        chainId: 1,
        routes: [demoRoute],
      }),
    } as any;

    const stellarDex = {
      swapToXlm: vi.fn().mockResolvedValue({
        hash: "0xstellar",
        acceptedPrice: 1.1,
      }),
    } as any;

    const swapper = new SwapService({
      routeService,
      walletService,
      stellarDex,
    });

    const result = await swapper.executeSwap({
      quote: {
        routes: { "0xfrom": [demoRoute] },
        tempAccount: "0xwallet",
        validUntil: Date.now() + 60000,
      },
      chainId: 1,
      gasPayer: "0xuser",
      signer: vi.fn().mockResolvedValue("0xhash"),
      routes: [demoRoute],
      stellarSecret: "SCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      stellarAssetCode: "AllbridgeUSD",
      stellarIssuer: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      stellarChainId: 7,
    });

    expect(routeService.initiate).toHaveBeenCalled();
    expect(stellarDex.swapToXlm).toHaveBeenCalled();
    expect(result.stellarSwap?.hash).toBe("0xstellar");
    expect(result.metrics.initiate).toBeGreaterThanOrEqual(0);
  });
});

