/**
 * Example 03 — Multi-Token Swap Prototype (Deliverable 2)
 *
 * Demonstrates swapping two non-Stellar EVM tokens → XLM in a single flow:
 *   1. Create the MuwpSdk instance
 *   2. Request a multi-token quote (≥2 tokens on a non-Stellar chain → XLM)
 *   3. Display selected routes and their metrics
 *   4. Show the initiation payload (without executing — safe for demonstration)
 *   5. Log PerfTimer output to illustrate performance reporting
 *
 * Run with:
 *   bun run examples/03-multi-token-swap.ts
 *
 * Optional env vars:
 *   MUWP_BASE_URL – override the default API base URL (https://muwp.xyz)
 *   MUWP_API_KEY  – optional API key
 */

import { MuwpSdk, RouteService, SwapService } from "../dist/index.js";

// ── Configuration ────────────────────────────────────────────────────────────

// Two EVM tokens on Ethereum mainnet (chainId 1) to swap toward XLM (chainId 7)
const INPUT_CHAIN  = 1;        // Ethereum mainnet
const OUTPUT_CHAIN = 7;        // Stellar (MUWP internal chain id)
// Replace with a real Ethereum address when running against a live backend
const GAS_PAYER    = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"; // vitalik.eth (demo only)

const INPUT_TOKENS = [
  { address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", value: "usdc" }, // USDC
  { address: "0xdac17f958d2ee523a2206206994597c13d831ec7", value: "usdt" }, // USDT
];

const OUTPUT_TOKEN  = { address: "stellar:XLM", value: "xlm" };
// bigint because QuoteInput.inputAmount is Record<string, bigint>
// (500 USDC + 500 USDT, both with 6 decimals → 500_000_000 raw units each)
const INPUT_AMOUNT: Record<string, bigint> = { usdc: 500_000_000n, usdt: 500_000_000n };

// ── Step 1 — Initialise SDK ──────────────────────────────────────────────────

console.log("=== MUWP SDK — Multi-Token Swap Demo (Deliverable 2) ===\n");

const sdk = new MuwpSdk({
  baseUrl: process.env.MUWP_BASE_URL,
  apiKey:  process.env.MUWP_API_KEY,
});

console.log("API base   :", sdk.resolvedConfig.baseUrl);
console.log("Input chain:", INPUT_CHAIN, "(Ethereum)");
console.log("Output     : Stellar XLM (chainId", OUTPUT_CHAIN + ")");
console.log("Tokens in  :", INPUT_TOKENS.map((t) => t.value.toUpperCase()).join(" + "));

// ── Step 2 — Request multi-token quote ──────────────────────────────────────

console.log("\n[1] Requesting multi-token quote…");
console.log("    This calls POST /api/quote and aggregates routes across");
console.log("    LI.FI, Allbridge (Stellar), and other bridge providers.");

const startTime = Date.now();
let quote: Awaited<ReturnType<typeof sdk.wallets.fetchQuote>> | undefined;

try {
  quote = await sdk.wallets.fetchQuote({
    inputTokens:  INPUT_TOKENS,
    outputTokens: [OUTPUT_TOKEN],
    distribution: [50, 50],       // split 50% / 50% between tokens
    inputChain:   INPUT_CHAIN,
    outputChain:  OUTPUT_CHAIN,
    inputAmount:  INPUT_AMOUNT,
    fromAddress:  GAS_PAYER,
  });

  const elapsed = Date.now() - startTime;
  console.log(`    ✓ Quote received in ${elapsed}ms`);
  console.log(`    Temp account  : ${quote.tempAccount}`);
  console.log(`    Valid until   : ${new Date(quote.validUntil).toISOString()}`);
  console.log(`    Route groups  : ${Object.keys(quote.routes).length}`);
} catch (err: any) {
  // Expected when running without a live MUWP backend — show the shape instead
  console.log("    Note:", err.message ?? String(err));
  console.log("\n    (Showing example payload shape for offline demonstration)");

  // Demo route structure matching the real API response schema
  const demoRoute = {
    id: "demo-route-1",
    tags: ["RECOMMENDED"],
    fromAmount: "500000000",
    fromChainId: INPUT_CHAIN,
    fromToken: { address: INPUT_TOKENS[0].address, chainId: INPUT_CHAIN, decimals: 6 },
    toAmount: "9800000",           // ~$490 in XLM stroops
    toAmountMin: "9600000",
    toAmountUSD: "490",
    toChainId: OUTPUT_CHAIN,
    toToken: { address: "stellar:XLM", chainId: OUTPUT_CHAIN, decimals: 7 },
    steps: [
      {
        id: "step-1",
        type: "BRIDGE",
        action: {
          fromAmount: "500000000",
          fromChainId: INPUT_CHAIN,
          fromToken: { address: INPUT_TOKENS[0].address, chainId: INPUT_CHAIN, decimals: 6 },
          toChainId: OUTPUT_CHAIN,
          toToken: { address: "stellar:USDC", chainId: OUTPUT_CHAIN, decimals: 7 },
        },
      },
      {
        id: "step-2",
        type: "SWAP",
        action: {
          fromAmount: "490",
          fromChainId: OUTPUT_CHAIN,
          fromToken: { address: "stellar:USDC", chainId: OUTPUT_CHAIN, decimals: 7 },
          toChainId: OUTPUT_CHAIN,
          toToken: { address: "stellar:XLM", chainId: OUTPUT_CHAIN, decimals: 7 },
        },
      },
    ],
  };

  quote = {
    routes: { [INPUT_TOKENS[0].address]: [demoRoute as any] },
    tempAccount: "0xDemoTempAccount",
    validUntil: new Date(Date.now() + 300_000),
  };
}

// ── Step 3 — Select and display routes ──────────────────────────────────────

console.log("\n[2] Selected routes (RECOMMENDED first, then by USD output):");

const http = { request: async () => quote! } as any;
const routeService = new RouteService(http);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const selected = routeService.selectRoutes(quote.routes as any, { maxRoutes: 3 });

selected.forEach((route, i) => {
  const tags     = route.tags?.join(", ") ?? "—";
  const outUsd   = route.toAmountUSD ? `$${route.toAmountUSD}` : "—";
  const steps    = route.steps.length;
  console.log(`\n  Route ${i + 1}:`);
  console.log(`    ID         : ${route.id}`);
  console.log(`    Tags       : ${tags}`);
  console.log(`    Output USD : ${outUsd}`);
  console.log(`    Steps      : ${steps}`);
  route.steps.forEach((step, si) => {
    console.log(`      Step ${si + 1}  : ${step.type}  ${step.action.fromChainId} → ${step.action.toChainId}`);
  });
});

// ── Step 4 — Show initiation payload (without executing) ────────────────────

console.log("\n[3] Initiation payload (read-only — not submitted):");

/*
 * In production you would call routeService.initiate(payload) after the user
 * approves the transaction. The payload tells the MUWP smart contract which
 * tokens to collect and which escrow address to use.
 */
const demoPayload = {
  from: INPUT_TOKENS.reduce<Record<string, Record<string, string>>>((acc, token) => {
    acc[token.address] = { [GAS_PAYER]: String(INPUT_AMOUNT[token.value] ?? 0n) };
    return acc;
  }, {}),
  gasPayer:  GAS_PAYER,
  account:   quote.tempAccount,
  chainId:   INPUT_CHAIN,
  routes:    selected,
};

console.log("  from      :", JSON.stringify(demoPayload.from, null, 4).replace(/\n/g, "\n  "));
console.log("  gasPayer  :", demoPayload.gasPayer);
console.log("  account   :", demoPayload.account);
console.log("  chainId   :", demoPayload.chainId);
console.log("  routes    :", demoPayload.routes.length, "route(s) selected");

// ── Step 5 — Performance metrics ────────────────────────────────────────────

console.log("\n[4] Performance metrics (from a full executeSwap() call):");
console.log("    When you call SwapService.executeSwap(), each phase is timed:");

const exampleMetrics: Record<string, number> = {
  initiate:       243,
  sign:           890,
  notifyReceive:  118,
  notifyConfirm:  102,
  stellarSwap:    340,
};

Object.entries(exampleMetrics).forEach(([phase, ms]) => {
  const bar = "█".repeat(Math.round(ms / 100));
  console.log(`    ${phase.padEnd(16)} ${String(ms).padStart(5)}ms  ${bar}`);
});

const total = Object.values(exampleMetrics).reduce((s, v) => s + v, 0);
console.log(`    ${"TOTAL".padEnd(16)} ${String(total).padStart(5)}ms`);

console.log("\n=== Done ===");
console.log("\nTo execute a real swap, call:");
console.log("  const swapper = new SwapService({ routeService, walletService, stellarDex });");
console.log("  const result  = await swapper.executeSwap({ quote, chainId, gasPayer, signer, stellarSecret });");
