# Deliverable 2 — Multi-Token Swap Prototype

**Status:** Complete  
**Branch:** `main`

---

## Grant Requirements

> Working prototype that accepts ≥2 non-Stellar tokens → XLM. Internal tests with performance reports.

---

## Implementation

### Core Logic — `SwapService.quoteToStellar()`

**File:** `packages/sdk/src/services/SwapService.ts`

The D2 constraint is enforced in `quoteToStellar()`:

```typescript
// Validates ≥2 input tokens AND non-Stellar input chain
async quoteToStellar(input: SwapQuoteInput) {
  const requireMulti = typeof input.ensureMultiInput === "undefined" || input.ensureMultiInput;
  if (requireMulti && input.inputTokens.length < 2) {
    throw new Error("At least two input tokens required");
  }
  if (requireMulti && input.inputChain === 7) {
    throw new Error("Input chain must be non-Stellar for the prototype");
  }
  return this.deps.walletService.requestManagedWallet(input);
}
```

The full swap flow (`executeSwap`) orchestrates:

1. **Route selection** — `RouteService.selectRoutes()` picks best routes from the quote
2. **Initiation** — `RouteService.initiate()` registers the transfer with the MUWP backend
3. **User signs** — caller's `signer` function signs and submits the EVM transaction
4. **Fund notification** — backend notified of received funds via `/api/receive-funds`
5. **Confirmation** — on-chain confirmation notified via `/api/chain-confirmed`
6. **Stellar DEX swap** — `StellarDexService.swapToXlm()` sells the bridged tokens for XLM

### API Route — `/api/quote`

**File:** `apps/web/app/api/quote/route.ts`

Aggregates routes across bridge providers based on `outputChain`:

| Output Chain | Provider |
|--------------|---------|
| EVM chains | LI.FI SDK (`lib/li.fi-ts/`) |
| Stellar (`chainId: 7`) | Allbridge Core SDK (`lib/allbridge/`) |
| Hedera (`chainId: 295`) | Hashport SDK (`lib/hashport/`) |
| Aptos (`chainId: 12360001`) | LayerZero (`lib/layerzero/aptos/`) |

The route endpoint streams JSON to avoid Vercel's function timeout on multi-bridge aggregation.

---

## Performance Reporting

`PerfTimer` (`packages/sdk/src/utils/perf.ts`) wraps each phase of `executeSwap()`:

```typescript
timer.start("initiate");
const initiate = await routeService.initiate(payload);
timer.stop("initiate");

timer.start("stellarSwap");
stellarSwap = await stellarDex.swapToXlm({ ... });
timer.stop("stellarSwap");

return { ...result, metrics: timer.summary() };
// → { initiate: 243, sign: 890, notifyReceive: 118, notifyConfirm: 102, stellarSwap: 340 }
```

The `metrics` field in `SwapExecutionResult` contains millisecond timings per phase.

---

## Tests

**File:** `packages/sdk/tests/swap.spec.ts`

```
✓ SwapService: runs multi-token prototype
```

The test verifies:
- `routeService.initiate()` is called
- `stellarDex.swapToXlm()` is called after the EVM leg completes
- `result.stellarSwap.hash` is present
- `result.metrics.initiate` is a non-negative number

**Example:** `packages/sdk/examples/03-multi-token-swap.ts`

Demonstrates:
1. Requesting a quote for USDC + USDT → XLM
2. Route selection and display (tags, USD output, step breakdown)
3. Initiation payload structure (offline — safe to run without a live backend)
4. Performance metrics breakdown per phase

---

## Running

```bash
cd packages/sdk

# Run D2 test
bunx vitest run tests/swap.spec.ts

# Run D2 example (offline-friendly — falls back to demo data without a live API)
bun run examples/03-multi-token-swap.ts
```

---

## Key Design Decisions

**Why stream `/api/quote`?**
Multi-bridge aggregation (LI.FI + Allbridge + Hashport) takes 2–6 seconds. Vercel Edge functions have a 25s timeout but the response buffer can cause premature closes. Streaming JSON chunks lets the frontend render partial results as they arrive.

**Why `inputChain !== 7` validation?**
Stellar-to-Stellar swaps don't need the EVM contract. The D2 prototype specifically covers the EVM → Stellar path where the smart contract (`MUWPTransfer.sol`) batches multi-token collection.

**Why `≥2` input tokens?**
The distinguishing feature of D2 is handling multiple tokens in a single transaction — not just a standard bridge. The `ensureMultiInput` flag can be set to `false` to allow single-token flows via the same API for other use cases.
