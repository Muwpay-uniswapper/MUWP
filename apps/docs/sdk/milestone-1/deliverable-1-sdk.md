# Deliverable 1 — Core SDK

**Status:** Complete  
**Due:** 2025-05-14  
**Branch:** `arthur/sdk`

---

## Grant Requirements

> Functional APIs for wallet creation, asset issuance, and asset management. Stellar DEX integration. All workflows tested.

---

## Implementation

### Entry Point

`MuwpSdk` is the primary public interface, exposed from `packages/sdk/src/index.ts`:

```typescript
import { MuwpSdk } from "@muwp/sdk";

const sdk = new MuwpSdk({
  baseUrl: "https://muwp.xyz",   // optional — defaults to production
  apiKey:  "...",                // optional
});

// Managed wallet for quotes
const quote = await sdk.wallets.fetchQuote({ ... });

// Stellar asset management
const xdr = await sdk.assets.buildTrustlineTransaction({ ... });
```

---

### Wallet Creation — `WalletService`

**File:** `packages/sdk/src/services/wallet.ts`

| Method | Purpose |
|--------|---------|
| `fetchQuote(input)` | POST `/api/quote`, returns routes + managed temp account |
| `ensureTempAccount(input)` | Returns the temp account public key |
| `getAccount(address)` | Read cached account record |
| `getTrackedAccounts()` | List all cached accounts |

The temp account is a MUWP-managed Stellar account created server-side. Users send EVM tokens to it; the backend orchestrates the bridge → Stellar leg.

**Test:** `sdk/tests/wallet.spec.ts` — verifies account caching and `buildInitiatePayload()` matrix construction.

---

### Asset Management — `StellarAssetService`

**File:** `packages/sdk/src/services/asset.ts`

| Method | Purpose |
|--------|---------|
| `buildTrustlineTransaction(params)` | Returns unsigned XDR with `changeTrust` op |
| `buildIssuanceTransaction(params)` | Returns signed XDR with `payment` op + optional memo |
| `fetchBalances(account)` | Maps Horizon balances → `BalanceSummary[]` (XLM, custom assets, LP shares) |
| `estimateBridgeAmount(params)` | Calls Allbridge SDK to estimate cross-chain receive amount |
| `resolveBridgePair(params)` | Maps EVM chainId + token address → Allbridge source/destination token pair |
| `describeAsset(params)` | Full asset descriptor (code, issuer, decimals, bridge metadata) |
| `fetchSorobanBalance(contractId, account)` | Queries Soroban contract storage for token balance |

**Tests:** `sdk/tests/asset.spec.ts` — 11 tests covering all core methods:

```
✓ buildTrustlineTransaction: returns XDR with changeTrust operation
✓ buildTrustlineTransaction: encodes correct asset code and issuer
✓ buildIssuanceTransaction: returns signed XDR with payment operation
✓ buildIssuanceTransaction: includes text memo when provided
✓ buildIssuanceTransaction: omits memo when not provided
✓ fetchBalances: maps native XLM balance
✓ fetchBalances: maps custom asset balance with limit
✓ fetchBalances: maps LP share balance
✓ resolveBridgePair: resolves EVM chainId to source and destination token pair
✓ resolveBridgePair: throws when chain has no Allbridge mapping
✓ resolveBridgePair: throws when token is unsupported on source chain
```

**Example:** `packages/sdk/examples/01-asset-management.ts`

---

### Stellar DEX Integration — `StellarDexService`

**File:** `packages/sdk/src/services/StellarDexService.ts`

| Method | Purpose |
|--------|---------|
| `fetchOrderbook(input)` | Queries Horizon for bid/ask orderbook for a trading pair |
| `placeMarketOrder(input)` | Builds + signs + submits `manageSellOffer` transaction at best bid |
| `swapToXlm(input)` | Alias for `placeMarketOrder` — sells bridged asset for XLM |

**Tests:** `sdk/tests/dex.spec.ts` — 5 tests:

```
✓ fetchOrderbook: returns bids and asks for the requested pair
✓ fetchOrderbook: defaults buying asset to XLM when not specified
✓ swapToXlm: submits a market order at the best bid price
✓ swapToXlm: uses caller-supplied minPrice when provided
✓ swapToXlm: throws when no bids are available
```

**Example:** `packages/sdk/examples/02-stellar-dex.ts`

---

### Route Selection — `RouteService`

**File:** `packages/sdk/src/services/RouteService.ts`

| Method | Purpose |
|--------|---------|
| `quote(input)` | Aggregates routes from all bridge providers via `/api/quote` |
| `selectRoutes(routes, opts)` | Sorts by RECOMMENDED tag then USD output; returns top N |
| `initiate(input)` | Submits initiation to `/api/initiate` |
| `notifyReceiveFunds(input)` | Notifies backend that user sent funds |
| `notifyChainConfirmed(input)` | Notifies backend of on-chain confirmation |
| `buildSenderMatrix(routes, owner)` | Builds `token → {address → amount}` map for initiation |

**Test:** `sdk/tests/quote.spec.ts`

---

## File Structure

```
packages/sdk/
├── src/
│   ├── index.ts                    ← Public API (MuwpSdk, all exports)
│   ├── config.ts                   ← BaseSdkConfig, resolveBaseSdkConfig
│   ├── http/client.ts              ← HttpClient (fetch wrapper with Zod validation)
│   ├── services/
│   │   ├── asset.ts                ← StellarAssetService (D1 core)
│   │   ├── wallet.ts               ← WalletService (new, quote-based)
│   │   ├── StellarDexService.ts    ← StellarDexService (D1 DEX)
│   │   ├── RouteService.ts         ← RouteService (routing + initiation)
│   │   └── SwapService.ts          ← SwapService (D2 orchestration)
│   ├── types/                      ← Zod schemas + inferred TypeScript types
│   └── utils/perf.ts               ← PerfTimer (performance reporting)
├── tests/
│   ├── asset.spec.ts               ← 11 tests (D1)
│   ├── dex.spec.ts                 ← 5 tests (D1)
│   ├── wallet.spec.ts              ← 1 test
│   ├── quote.spec.ts               ← 1 test
│   └── swap.spec.ts                ← 1 test (D2)
└── examples/
    ├── 01-asset-management.ts      ← D1 demo
    ├── 02-stellar-dex.ts           ← D1 DEX demo
    └── 03-multi-token-swap.ts      ← D2 demo
```

---

## Running

```bash
cd packages/sdk

# Tests
bun run test                            # all tests
bunx vitest run tests/asset.spec.ts    # single file

# Build
bun run build      # outputs to dist/

# Type check
bunx tsc --noEmit
```
