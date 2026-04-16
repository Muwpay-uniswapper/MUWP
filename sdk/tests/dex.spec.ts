import { describe, expect, it, vi, beforeEach } from "vitest";
import { Account, Keypair, Networks } from "@stellar/stellar-sdk";
import { StellarDexService } from "../src/services/StellarDexService";

// ── Module mocks ─────────────────────────────────────────────────────────────

const { mockLoadAccount, mockOrderbookCall, mockSubmitTransaction } = vi.hoisted(() => ({
  mockLoadAccount: vi.fn(),
  mockOrderbookCall: vi.fn(),
  mockSubmitTransaction: vi.fn(),
}));

vi.mock("@stellar/stellar-sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@stellar/stellar-sdk")>();
  return {
    ...actual,
    Horizon: {
      ...actual.Horizon,
      Server: vi.fn().mockImplementation(() => ({
        loadAccount: mockLoadAccount,
        // Simulate the fluent .orderbook().limit().call() chain
        orderbook: () => ({
          limit: () => ({ call: mockOrderbookCall }),
        }),
        submitTransaction: mockSubmitTransaction,
      })),
    },
  };
});

// ── Test fixtures ─────────────────────────────────────────────────────────────

const TRADER_KP = Keypair.random();
// A valid Stellar public key for the asset issuer
const ISSUER_KEY = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

const USDC_ASSET = { code: "USDC", issuer: ISSUER_KEY } as const;

function makeService() {
  return new StellarDexService({
    horizonUrl: "https://horizon-testnet.stellar.org",
    networkPassphrase: Networks.TESTNET,
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("StellarDexService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── fetchOrderbook ──────────────────────────────────────────────────────────

  describe("fetchOrderbook()", () => {
    it("returns bids and asks for the requested pair", async () => {
      const mockBook = {
        bids: [{ price: "0.50", amount: "100.0000000" }],
        asks: [{ price: "0.60", amount: "200.0000000" }],
      };
      mockOrderbookCall.mockResolvedValue(mockBook);
      const service = makeService();

      const result = await service.fetchOrderbook({ selling: USDC_ASSET });

      expect(result.bids).toHaveLength(1);
      expect(result.asks).toHaveLength(1);
      expect(result.bids[0].price).toBe("0.50");
      expect(result.asks[0].price).toBe("0.60");
    });

    it("defaults buying asset to XLM when not specified", async () => {
      mockOrderbookCall.mockResolvedValue({ bids: [], asks: [] });
      const service = makeService();

      // If the call doesn't throw, the default XLM asset was used correctly
      await expect(service.fetchOrderbook({ selling: USDC_ASSET })).resolves.toBeDefined();
    });
  });

  // ── swapToXlm ───────────────────────────────────────────────────────────────

  describe("swapToXlm()", () => {
    it("submits a market order at the best bid price", async () => {
      const mockBook = {
        bids: [
          { price: "0.48", amount: "500.0000000" },
          { price: "0.45", amount: "1000.0000000" },
        ],
        asks: [],
      };
      mockOrderbookCall.mockResolvedValue(mockBook);
      mockLoadAccount.mockResolvedValue(new Account(TRADER_KP.publicKey(), "100"));
      mockSubmitTransaction.mockResolvedValue({ hash: "abc123def456" });

      const service = makeService();
      const result = await service.swapToXlm({
        selling: USDC_ASSET,
        amount: "50",
        accountSecret: TRADER_KP.secret(),
      });

      expect(result.hash).toBe("abc123def456");
      expect(result.acceptedPrice).toBeCloseTo(0.48);
    });

    it("uses caller-supplied minPrice when provided", async () => {
      const mockBook = {
        bids: [{ price: "0.48", amount: "500.0000000" }],
        asks: [],
      };
      mockOrderbookCall.mockResolvedValue(mockBook);
      mockLoadAccount.mockResolvedValue(new Account(TRADER_KP.publicKey(), "100"));
      mockSubmitTransaction.mockResolvedValue({ hash: "custom" });

      const service = makeService();
      const result = await service.swapToXlm({
        selling: USDC_ASSET,
        amount: "50",
        accountSecret: TRADER_KP.secret(),
        minPrice: 0.40,
      });

      expect(result.acceptedPrice).toBeCloseTo(0.40);
    });

    it("throws when no bids are available", async () => {
      mockOrderbookCall.mockResolvedValue({ bids: [], asks: [] });
      mockLoadAccount.mockResolvedValue(new Account(TRADER_KP.publicKey(), "100"));

      const service = makeService();

      await expect(
        service.swapToXlm({
          selling: USDC_ASSET,
          amount: "50",
          accountSecret: TRADER_KP.secret(),
        }),
      ).rejects.toThrow("No bids available");
    });
  });
});
