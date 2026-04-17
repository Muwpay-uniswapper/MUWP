# MUWP — Stellar SDK Architecture

## Overview

The MUWP SDK is structured as a layered TypeScript package (`@muwp/sdk`) that bridges EVM chains to the Stellar ecosystem. The architecture separates concerns into distinct service layers, each with a single responsibility.

```
┌─────────────────────────────────────────────────────────────┐
│                     App / Developer                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                       MuwpSdk                                │
│   ┌─────────────┐   ┌──────────────────────────┐            │
│   │ WalletService│  │   StellarAssetService     │            │
│   └─────────────┘   └──────────────────────────┘            │
│   ┌──────────────────────────────────────────────┐          │
│   │           HttpClient (fetch + Zod)            │          │
│   └──────────────────────────────────────────────┘          │
└───────────────────────────┬─────────────────────────────────┘
                            │
          ┌─────────────────┼──────────────────────┐
          │                 │                        │
┌─────────▼──────┐  ┌───────▼──────┐  ┌─────────────▼──────┐
│  MUWP Backend  │  │  Horizon API  │  │  Allbridge Core SDK │
│  /api/quote    │  │  (Stellar)    │  │  (cross-chain)      │
│  /api/initiate │  └───────────────┘  └────────────────────┘
└────────────────┘
```

## Service Responsibilities

### `MuwpSdk` (primary entry point)
- Composes `WalletService` + `StellarAssetService`
- Exposes `resolvedConfig` (baseUrl, apiKey, fetch)
- Provides `ping()` health check

### `WalletService`
- Manages MUWP-issued temp accounts (server-side Stellar keypairs)
- Caches quote responses keyed by temp account address
- Interfaces with `/api/quote` to initiate multi-token transfer flows

### `StellarAssetService`
- Wraps `@stellar/stellar-sdk` for Horizon queries and transaction building
- Wraps `@allbridge/bridge-core-sdk` for cross-chain metadata and amount estimation
- Stateless transaction builders (returns XDR — never submits directly)

### `StellarDexService`
- Queries Horizon's DEX orderbook
- Builds and submits `manageSellOffer` transactions to convert bridged assets → XLM

### `RouteService` + `SwapService`
- `RouteService`: HTTP client wrapper for MUWP API (quote, initiate, receive, confirm)
- `SwapService`: Orchestrates the full EVM → Stellar swap lifecycle with PerfTimer instrumentation

## Transaction Flow

```
User (EVM)          MUWP Backend          Stellar Network
    │                     │                      │
    │── quote request ────►│                      │
    │◄─ routes + temp acct─│                      │
    │                     │                      │
    │── EVM tokens ───────►MUWPTransfer.sol       │
    │── sign + submit ────►│                      │
    │                     │── bridge trigger ────►│
    │                     │                      │── Allbridge bridge
    │                     │                      │◄─ bridged USDC arrives
    │                     │                      │
    │                     │          StellarDexService.swapToXlm()
    │                     │                      │── manageSellOffer
    │                     │                      │◄─ XLM credited
    │◄─ completion ────────│                      │
```

## Dependency Graph

```
MuwpSdk
 ├── HttpClient          (cross-fetch, Zod validation)
 ├── WalletService       (HttpClient)
 └── StellarAssetService (@stellar/stellar-sdk, @allbridge/bridge-core-sdk)

SwapService (standalone, injected via constructor)
 ├── RouteService        (old HttpClient)
 ├── WalletService       (old, with buildInitiatePayload)
 └── StellarDexService   (@stellar/stellar-sdk)
```

## Key Design Principles

1. **Stateless transaction builders** — `buildTrustlineTransaction` and `buildIssuanceTransaction` return XDR envelopes that callers sign and submit. The SDK never holds private keys in memory beyond the scope of a single call.

2. **Lazy chain metadata** — `StellarAssetService` fetches Allbridge `chainDetailsMap()` once and caches it per instance. A new instance always fetches fresh data.

3. **PerfTimer instrumentation** — `SwapService.executeSwap()` times each phase independently (initiate, sign, receive, confirm, stellarSwap) and returns the summary in `SwapExecutionResult.metrics`.

4. **Zod boundary validation** — all inputs crossing the network boundary (quote, initiate) are validated with Zod schemas before submission and on response parsing.
