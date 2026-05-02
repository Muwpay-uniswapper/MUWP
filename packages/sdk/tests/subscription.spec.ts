import { describe, expect, it, vi, beforeEach } from "vitest";
import { Keypair, SorobanRpc, StrKey, nativeToScVal } from "@stellar/stellar-sdk";
import { SorobanSubscriptionService } from "../src/services/SorobanSubscriptionService";

const { mockGetAccount, mockSimulate, mockSend, mockGetTx, mockAssemble } = vi.hoisted(() => ({
  mockGetAccount: vi.fn(),
  mockSimulate: vi.fn(),
  mockSend: vi.fn(),
  mockGetTx: vi.fn(),
  mockAssemble: vi.fn(),
}));

vi.mock("@stellar/stellar-sdk", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@stellar/stellar-sdk")>();
  return {
    ...actual,
    SorobanRpc: {
      ...actual.SorobanRpc,
      Server: vi.fn().mockImplementation(() => ({
        getAccount: mockGetAccount,
        simulateTransaction: mockSimulate,
        sendTransaction: mockSend,
        getTransaction: mockGetTx,
      })),
      // assembleTransaction is a named export on SorobanRpc namespace
      assembleTransaction: mockAssemble,
    },
  };
});

const FAKE_KP = Keypair.random();
// Generate valid StrKeys from fixed buffers for deterministic fixtures
const CONTRACT_ID = StrKey.encodeContract(Buffer.alloc(32, 0x01));
// Token and recipient must be valid G-type (account) or C-type (contract) addresses
// Using Keypair.random() gives a valid G-type public key each time
const TOKEN_KP = Keypair.random();
const RECIPIENT_KP = Keypair.random();

function makeService() {
  return new SorobanSubscriptionService({
    sorobanUrl: "https://soroban-testnet.stellar.org",
  });
}

describe("SorobanSubscriptionService", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockGetAccount.mockResolvedValue({
      accountId: () => FAKE_KP.publicKey(),
      sequenceNumber: () => "100",
      incrementSequenceNumber: vi.fn(),
    });

    // Successful simulation — must NOT have an "error" key (isSimulationError checks "error" in sim)
    mockSimulate.mockResolvedValue({
      result: {
        retval: nativeToScVal(1, { type: "u64" }),
      },
      minResourceFee: "100",
      transactionData: { toXDR: vi.fn().mockReturnValue("") },
    });

    // assembleTransaction returns a TransactionBuilder-like object whose .build()
    // returns a Transaction-like object with a .sign() method
    mockAssemble.mockReturnValue({
      build: () => ({ sign: vi.fn() }),
    });

    mockSend.mockResolvedValue({ hash: "abc123def456", status: "PENDING" });

    // getTransaction returns SUCCESS immediately so waitForConfirmation resolves
    // without sleeping, and the subsequent direct call in createSubscription also
    // returns SUCCESS with a real XDR return value that scValToNative can handle.
    mockGetTx.mockResolvedValue({
      status: SorobanRpc.Api.GetTransactionStatus.SUCCESS,
      returnValue: nativeToScVal(1, { type: "u64" }),
    });
  });

  // ── createSubscription() ──────────────────────────────────────────────────

  describe("createSubscription()", () => {
    it("calls sendTransaction and returns a subscription id", async () => {
      const service = makeService();
      const id = await service.createSubscription({
        contractId: CONTRACT_ID,
        callerSecret: FAKE_KP.secret(),
        token: TOKEN_KP.publicKey(),
        recipient: RECIPIENT_KP.publicKey(),
        amount: 100n,
        intervalSeconds: 3600,
      });
      expect(mockSend).toHaveBeenCalledOnce();
      // scValToNative on a u64 ScVal returns bigint at runtime (TypeScript "as number" is only a type cast)
      expect(typeof id === "number" || typeof id === "bigint").toBe(true);
    });

    it("throws when simulation returns an error", async () => {
      // isSimulationError checks for "error" key in the sim object
      mockSimulate.mockResolvedValue({ error: "auth required" });
      const service = makeService();
      await expect(
        service.createSubscription({
          contractId: CONTRACT_ID,
          callerSecret: FAKE_KP.secret(),
          token: TOKEN_KP.publicKey(),
          recipient: RECIPIENT_KP.publicKey(),
          amount: 100n,
          intervalSeconds: 3600,
        }),
      ).rejects.toThrow("Simulation failed");
    });
  });

  // ── cancelSubscription() ─────────────────────────────────────────────────

  describe("cancelSubscription()", () => {
    it("sends a cancel transaction and returns the hash", async () => {
      const service = makeService();
      const hash = await service.cancelSubscription({
        contractId: CONTRACT_ID,
        subscriberSecret: FAKE_KP.secret(),
        subscriptionId: 1,
      });
      expect(hash).toBe("abc123def456");
    });
  });

  // ── triggerPayment() ──────────────────────────────────────────────────────

  describe("triggerPayment()", () => {
    it("sends a trigger transaction and returns the hash", async () => {
      const service = makeService();
      const hash = await service.triggerPayment({
        contractId: CONTRACT_ID,
        callerSecret: FAKE_KP.secret(),
        subscriptionId: 1,
      });
      expect(hash).toBe("abc123def456");
    });
  });
});
