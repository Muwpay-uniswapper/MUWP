import { describe, expect, it, vi, beforeEach } from "vitest";
import { Account, Keypair, Networks, Transaction } from "@stellar/stellar-sdk";
import { StellarAssetService } from "../src/services/asset";

// ── Module mocks (hoisted so they're available inside vi.mock factories) ────

const { mockLoadAccount } = vi.hoisted(() => ({
  mockLoadAccount: vi.fn(),
}));

const { mockChainDetailsMap, mockGetAmountToBeReceived } = vi.hoisted(() => ({
  mockChainDetailsMap: vi.fn(),
  mockGetAmountToBeReceived: vi.fn(),
}));

vi.mock("@stellar/stellar-sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@stellar/stellar-sdk")>();
  return {
    ...actual,
    Horizon: {
      ...actual.Horizon,
      Server: vi.fn().mockImplementation(() => ({
        loadAccount: mockLoadAccount,
      })),
    },
  };
});

vi.mock("@allbridge/bridge-core-sdk", () => ({
  AllbridgeCoreSdk: vi.fn().mockImplementation(() => ({
    chainDetailsMap: mockChainDetailsMap,
    getAmountToBeReceived: mockGetAmountToBeReceived,
  })),
  ChainSymbol: { ETH: "ETH", BSC: "BSC", STLR: "STLR", SRB: "SRB" },
  nodeRpcUrlsDefault: {},
}));

// ── Test fixtures ───────────────────────────────────────────────────────────

const USER_KP = Keypair.random();
const ISSUER_KP = Keypair.random();

// Minimal chain map shared across resolveBridgePair tests
const MOCK_CHAIN_DETAILS = {
  ETH: {
    chainId: "1",
    tokens: [{ tokenAddress: "0xusdc", symbol: "USDC", decimals: 6 }],
  },
  STLR: {
    chainId: undefined,
    allbridgeChainId: "7",
    tokens: [{ tokenAddress: "stellar:usdc", symbol: "USDC", decimals: 7 }],
  },
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeService() {
  return new StellarAssetService({ networkPassphrase: Networks.TESTNET });
}

function mockAccountFor(kp: Keypair) {
  return new Account(kp.publicKey(), "100");
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("StellarAssetService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── buildTrustlineTransaction ─────────────────────────────────────────────

  describe("buildTrustlineTransaction()", () => {
    it("returns XDR containing a changeTrust operation", async () => {
      mockLoadAccount.mockResolvedValue(mockAccountFor(USER_KP));
      const service = makeService();

      const xdr = await service.buildTrustlineTransaction({
        account: USER_KP.publicKey(),
        assetCode: "USDC",
        issuer: ISSUER_KP.publicKey(),
      });

      expect(typeof xdr).toBe("string");
      const tx = new Transaction(xdr, Networks.TESTNET);
      expect(tx.operations).toHaveLength(1);
      expect(tx.operations[0].type).toBe("changeTrust");
    });

    it("encodes the correct asset code and issuer in the operation", async () => {
      mockLoadAccount.mockResolvedValue(mockAccountFor(USER_KP));
      const service = makeService();

      const xdr = await service.buildTrustlineTransaction({
        account: USER_KP.publicKey(),
        assetCode: "MYTKN",
        issuer: ISSUER_KP.publicKey(),
      });

      const tx = new Transaction(xdr, Networks.TESTNET);
      const op = tx.operations[0] as any;
      expect(op.line.code).toBe("MYTKN");
      expect(op.line.issuer).toBe(ISSUER_KP.publicKey());
    });
  });

  // ── buildIssuanceTransaction ──────────────────────────────────────────────

  describe("buildIssuanceTransaction()", () => {
    it("returns signed XDR with a payment operation", async () => {
      mockLoadAccount.mockResolvedValue(mockAccountFor(ISSUER_KP));
      const service = makeService();

      const xdr = await service.buildIssuanceTransaction({
        issuerSecret: ISSUER_KP.secret(),
        destination: USER_KP.publicKey(),
        assetCode: "USDC",
        amount: "100",
      });

      expect(typeof xdr).toBe("string");
      const tx = new Transaction(xdr, Networks.TESTNET);
      expect(tx.operations[0].type).toBe("payment");
      expect(tx.signatures.length).toBeGreaterThan(0);
    });

    it("includes a text memo when provided", async () => {
      mockLoadAccount.mockResolvedValue(mockAccountFor(ISSUER_KP));
      const service = makeService();

      const xdr = await service.buildIssuanceTransaction({
        issuerSecret: ISSUER_KP.secret(),
        destination: USER_KP.publicKey(),
        assetCode: "USDC",
        amount: "10",
        memo: "transfer-ref",
      });

      const tx = new Transaction(xdr, Networks.TESTNET);
      expect(tx.memo.value?.toString()).toBe("transfer-ref");
    });

    it("omits memo when not provided", async () => {
      mockLoadAccount.mockResolvedValue(mockAccountFor(ISSUER_KP));
      const service = makeService();

      const xdr = await service.buildIssuanceTransaction({
        issuerSecret: ISSUER_KP.secret(),
        destination: USER_KP.publicKey(),
        assetCode: "USDC",
        amount: "10",
      });

      const tx = new Transaction(xdr, Networks.TESTNET);
      expect(tx.memo.type).toBe("none");
    });
  });

  // ── fetchBalances ─────────────────────────────────────────────────────────

  describe("fetchBalances()", () => {
    it("maps native XLM balance", async () => {
      mockLoadAccount.mockResolvedValue({
        balances: [{ asset_type: "native", balance: "100.5000000" }],
      });
      const service = makeService();

      const balances = await service.fetchBalances(USER_KP.publicKey());

      expect(balances).toHaveLength(1);
      expect(balances[0]).toMatchObject({
        assetCode: "XLM",
        isNative: true,
        balance: "100.5000000",
        assetIssuer: undefined,
      });
    });

    it("maps custom asset balance with limit", async () => {
      mockLoadAccount.mockResolvedValue({
        balances: [
          {
            asset_type: "credit_alphanum4",
            asset_code: "USDC",
            asset_issuer: ISSUER_KP.publicKey(),
            balance: "50.0000000",
            limit: "922337203685.4775807",
          },
          { asset_type: "native", balance: "10.0000000" },
        ],
      });
      const service = makeService();

      const balances = await service.fetchBalances(USER_KP.publicKey());

      expect(balances).toHaveLength(2);
      const usdc = balances.find((b) => b.assetCode === "USDC");
      expect(usdc).toMatchObject({
        assetCode: "USDC",
        assetIssuer: ISSUER_KP.publicKey(),
        isNative: false,
        balance: "50.0000000",
        limit: "922337203685.4775807",
      });
    });

    it("maps liquidity pool share balance", async () => {
      mockLoadAccount.mockResolvedValue({
        balances: [{ asset_type: "liquidity_pool_shares", balance: "5.0000000" }],
      });
      const service = makeService();

      const balances = await service.fetchBalances(USER_KP.publicKey());

      expect(balances[0]).toMatchObject({ assetCode: "LP", isNative: false });
    });
  });

  // ── resolveBridgePair ─────────────────────────────────────────────────────

  describe("resolveBridgePair()", () => {
    it("resolves EVM chainId to source and destination token pair", async () => {
      mockChainDetailsMap.mockResolvedValue(MOCK_CHAIN_DETAILS);
      const service = makeService();

      const result = await service.resolveBridgePair({
        fromChainId: 1,
        fromTokenAddress: "0xusdc",
      });

      expect(result.sourceToken.symbol).toBe("USDC");
      expect(result.destinationToken.symbol).toBe("USDC");
      expect(result.sourceToken.decimals).toBe(6);
      expect(result.destinationToken.decimals).toBe(7);
    });

    it("throws when the chain has no Allbridge mapping", async () => {
      mockChainDetailsMap.mockResolvedValue(MOCK_CHAIN_DETAILS);
      const service = makeService();

      await expect(
        service.resolveBridgePair({ fromChainId: 999, fromTokenAddress: "0xusdc" }),
      ).rejects.toThrow("No Allbridge mapping for chain 999");
    });

    it("throws when the token is not supported on the source chain", async () => {
      mockChainDetailsMap.mockResolvedValue(MOCK_CHAIN_DETAILS);
      const service = makeService();

      await expect(
        service.resolveBridgePair({ fromChainId: 1, fromTokenAddress: "0xunknown" }),
      ).rejects.toThrow("Unsupported token pair");
    });
  });
});
