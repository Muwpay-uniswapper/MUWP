/**
 * Example 02 — Stellar DEX Integration (Deliverable 1)
 *
 * Demonstrates how to interact with the Stellar decentralised exchange:
 *   1. Initialise StellarDexService
 *   2. Fetch the USDC/XLM orderbook from Horizon
 *   3. Display best bids and asks
 *   4. (Commented out) Place a real market sell order via swapToXlm()
 *
 * Run with:
 *   bun run examples/02-stellar-dex.ts
 */

import { StellarDexService } from "../dist/index.js";
import { Networks } from "@stellar/stellar-sdk";

// ── Configuration ────────────────────────────────────────────────────────────

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const NETWORK     = Networks.TESTNET;

// Testnet USDC issued by Centre / Circle equivalent (use a known testnet issuer)
const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const USDC_ASSET  = { code: "USDC", issuer: USDC_ISSUER } as const;

// ── Step 1 — Initialise DEX service ─────────────────────────────────────────

console.log("=== MUWP SDK — Stellar DEX Demo ===\n");

const dex = new StellarDexService({
  horizonUrl:        HORIZON_URL,
  networkPassphrase: NETWORK,
});

console.log("Horizon URL :", HORIZON_URL);
console.log("Network     :", NETWORK.slice(0, 30) + "…");

// ── Step 2 — Fetch orderbook ────────────────────────────────────────────────

console.log("\n[1] Fetching USDC/XLM orderbook (top 5 levels)…");

try {
  const book = await dex.fetchOrderbook({
    selling: USDC_ASSET,
    buying:  { code: "XLM", issuer: "" },
    limit:   5,
  });

  // ── Step 3 — Display bids and asks ────────────────────────────────────────

  console.log("\n  BIDS (sell USDC, receive XLM):");
  if (book.bids.length === 0) {
    console.log("    (no bids)");
  } else {
    book.bids.forEach((bid, i) => {
      console.log(`    #${i + 1}  price=${bid.price.padStart(12)}  amount=${bid.amount}`);
    });
  }

  console.log("\n  ASKS (buy USDC, pay XLM):");
  if (book.asks.length === 0) {
    console.log("    (no asks)");
  } else {
    book.asks.forEach((ask, i) => {
      console.log(`    #${i + 1}  price=${ask.price.padStart(12)}  amount=${ask.amount}`);
    });
  }

  const bestBid = book.bids[0];
  const bestAsk = book.asks[0];
  if (bestBid && bestAsk) {
    const spread = (Number(bestAsk.price) - Number(bestBid.price)).toFixed(6);
    console.log(`\n  Best bid : ${bestBid.price}`);
    console.log(`  Best ask : ${bestAsk.price}`);
    console.log(`  Spread   : ${spread}`);
  }
} catch (err: any) {
  console.log("  Note:", err.message ?? String(err));
}

// ── Step 4 — (Optional) Market order ────────────────────────────────────────
//
// To place a real order, uncomment and set STELLAR_TRADER_SECRET:
//
// const traderSecret = process.env.STELLAR_TRADER_SECRET;
// if (traderSecret) {
//   console.log("\n[2] Placing market sell order: 10 USDC → XLM…");
//   try {
//     const result = await dex.swapToXlm({
//       selling:       USDC_ASSET,
//       amount:        "10",
//       accountSecret: traderSecret,
//     });
//     console.log("  ✓ Order submitted");
//     console.log("  Hash          :", result.hash);
//     console.log("  Accepted price:", result.acceptedPrice);
//   } catch (err: any) {
//     console.log("  Error:", err.message ?? String(err));
//   }
// } else {
//   console.log("\n[2] Market order — set STELLAR_TRADER_SECRET to enable");
// }

console.log("\n=== Done ===");
