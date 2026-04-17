/**
 * Example 01 — Asset Management (Deliverable 1)
 *
 * Demonstrates the core SDK workflow for Stellar asset management:
 *   1. Initialize MuwpSdk + StellarAssetService
 *   2. Create a trustline for an Allbridge-bridged asset
 *   3. Issue (mint) tokens to a destination account
 *   4. Fetch and display account balances
 *   5. Estimate a cross-chain bridge amount
 *
 * Run with:
 *   bun run examples/01-asset-management.ts
 *
 * Required env vars (or fill in the placeholders below):
 *   STELLAR_ACCOUNT_PUB   – public key of the account that needs the trustline
 *   STELLAR_ISSUER_SECRET – secret key of the asset issuer (for issuance demo)
 *   STELLAR_DESTINATION   – public key that will receive the issued tokens
 */

import { MuwpSdk, StellarAssetService } from "../src/index";
import { Networks } from "@stellar/stellar-sdk";

// ── Configuration ────────────────────────────────────────────────────────────

const HORIZON_URL    = "https://horizon-testnet.stellar.org";
const NETWORK        = Networks.TESTNET;
const ASSET_CODE     = "USDC";

// Replace these with real testnet keys, or set the env vars above.
const ACCOUNT_PUB    = process.env.STELLAR_ACCOUNT_PUB    ?? "GAHJJJKMOKYE4RVPZEWZTKH5FVI4PA3VL7GK2LFNUBSGBV3KKBF4KSAB";
const ISSUER_SECRET  = process.env.STELLAR_ISSUER_SECRET  ?? "<ISSUER_SECRET_KEY>";
const DESTINATION    = process.env.STELLAR_DESTINATION    ?? ACCOUNT_PUB;

// EVM token to estimate bridging from (USDC on Ethereum mainnet)
const EVM_CHAIN_ID   = 1;
const EVM_TOKEN_ADDR = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"; // USDC

// ── Step 1 — Initialise SDK ──────────────────────────────────────────────────

console.log("=== MUWP SDK — Asset Management Demo ===\n");

const sdk = new MuwpSdk();
console.log("SDK base URL:", sdk.resolvedConfig.baseUrl);

const assets = new StellarAssetService({
  horizonUrl:         HORIZON_URL,
  networkPassphrase:  NETWORK,
});

// ── Step 2 — Build trustline transaction ────────────────────────────────────

console.log("\n[1] Building trustline transaction…");
console.log(`    Account : ${ACCOUNT_PUB}`);
console.log(`    Asset   : ${ASSET_CODE}`);

/*
 * buildTrustlineTransaction() returns an unsigned XDR envelope that the
 * account holder must sign and submit via the Stellar network or Horizon.
 *
 * In a real app you would:
 *   1. Return this XDR to the frontend / wallet
 *   2. Have the user sign it with their Stellar wallet (e.g., Freighter)
 *   3. Submit the signed transaction to Horizon
 */
try {
  const trustlineXdr = await assets.buildTrustlineTransaction({
    account:   ACCOUNT_PUB,
    assetCode: ASSET_CODE,
    issuer:    DESTINATION, // For demo, destination doubles as issuer public key
  });
  console.log("    XDR (first 80 chars):", trustlineXdr.slice(0, 80) + "…");
  console.log("    ✓ Trustline XDR generated");
} catch (err: any) {
  // Network errors when the testnet account doesn't exist — expected in offline demo
  console.log("    Note:", err.message ?? String(err));
}

// ── Step 3 — Build issuance transaction ────────────────────────────────────

console.log("\n[2] Building issuance transaction…");
console.log(`    Amount : 100 ${ASSET_CODE}`);
console.log(`    Memo   : "muwp-demo"`);

/*
 * buildIssuanceTransaction() returns a signed XDR that the issuer can submit
 * directly to Horizon to mint tokens to the destination account.
 */
if (ISSUER_SECRET !== "<ISSUER_SECRET_KEY>") {
  try {
    const issuanceXdr = await assets.buildIssuanceTransaction({
      issuerSecret: ISSUER_SECRET,
      destination:  DESTINATION,
      assetCode:    ASSET_CODE,
      amount:       "100",
      memo:         "muwp-demo",
    });
    console.log("    XDR (first 80 chars):", issuanceXdr.slice(0, 80) + "…");
    console.log("    ✓ Issuance XDR generated and signed");
  } catch (err: any) {
    console.log("    Note:", err.message ?? String(err));
  }
} else {
  console.log("    (skipped — set STELLAR_ISSUER_SECRET to enable)");
}

// ── Step 4 — Fetch account balances ─────────────────────────────────────────

console.log("\n[3] Fetching balances for account…");

try {
  const balances = await assets.fetchBalances(ACCOUNT_PUB);
  if (balances.length === 0) {
    console.log("    No balances found (account may not exist on testnet)");
  } else {
    balances.forEach((b) => {
      const label = b.isNative ? "native" : `${b.assetType}`;
      console.log(`    ${b.assetCode.padEnd(12)} ${b.balance.padStart(20)}  [${label}]`);
    });
  }
} catch (err: any) {
  console.log("    Note:", err.message ?? String(err));
}

// ── Step 5 — Estimate bridge amount ─────────────────────────────────────────

console.log("\n[4] Estimating Allbridge cross-chain amount…");
console.log(`    From   : USDC on Ethereum (chainId ${EVM_CHAIN_ID})`);
console.log(`    To     : Stellar`);
console.log(`    Amount : 1 USDC (1_000_000 raw units, 6 decimals)`);

try {
  const estimate = await assets.estimateBridgeAmount({
    fromChainId:       EVM_CHAIN_ID,
    fromTokenAddress:  EVM_TOKEN_ADDR,
    amount:            1_000_000n, // 1.0 USDC in 6-decimal raw units
  });
  console.log(`    Estimated receive  : ${estimate.expectedAmountReadable} ${estimate.metadata.destinationToken.symbol}`);
  console.log(`    Source decimals    : ${estimate.metadata.sourceToken.decimals}`);
  console.log(`    Destination chain  : ${estimate.metadata.destinationChain.name ?? "Stellar"}`);
} catch (err: any) {
  console.log("    Note:", err.message ?? String(err));
}

console.log("\n=== Done ===");
