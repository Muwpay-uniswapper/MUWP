# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

All commands run from `MUWP/` unless noted.

```bash
# Development
npm run dev          # next dev --experimental-https (HTTPS required for wallet adapters)
npm run build        # production build
npm run lint         # next lint (ESLint)

# SDK (from MUWP/sdk/)
bun run build        # tsup — outputs to dist/
bun test             # vitest run (all tests)
bun test tests/quote.spec.ts   # single test file
biome check .        # lint SDK (not ESLint — Biome only in sdk/)

# Integration tests (from MUWP/)
bun test lib/allbridge/allbridge.test.ts
bun test lib/hashport/hashport.test.ts

# Smart contracts (from MUWP/)
forge build
forge test
forge test --match-test testName

# Playwright e2e (from MUWP/)
bunx playwright test
```

**Package manager**: The root workspace uses npm/bun. The SDK (`sdk/`) uses bun. pnpm-lock.yaml exists (migration in progress) but npm remains the primary runner for `next` commands.

## Architecture Overview

### Frontend (Next.js App Router)

`app/` uses the Next.js App Router. Entry point is `app/page.tsx` → `components/swapcard.tsx`.

Two Zustand stores drive the swap UI:
- `lib/core/data/swapStore.ts` — ephemeral UI state (tokens, amounts, sliders, bridge allow/deny lists)
- `lib/core/data/routeStore.ts` — fetched routes, tx history (persisted via `zustand/middleware/persist`), wallet config, ReactFlow viewport

Routes are rendered as an interactive ReactFlow graph in `components/flow/MainFlow.tsx`. Each edge is a bridge/DEX hop; clicking zooms into a `DetailNode`.

### API Routes (`app/api/`)

| Route | Purpose |
|-------|---------|
| `quote` | Aggregates across LI.FI, Allbridge, Hashport, LayerZero — **streamed JSON** to bypass Vercel timeouts |
| `initiate` | Validates KV temp account, computes gas, encodes `MUWPTransfer.transfer()` calldata with secp256k1 sig, fires Inngest event |
| `receive-funds` | Called after user sends to temp account |
| `chain-confirmed` | Called after on-chain confirmation |
| `status` | Polling endpoint |
| `recover-funds` | Triggers recovery flow |
| `inngest` | Inngest webhook handler |
| `uniswap` | Uniswap V2/V3 quote (backend in `backend/uniswap/`) |

### Bridge Routing (`/api/quote` dispatch)

Output chain determines the bridge handler:
- **EVM → EVM**: LI.FI SDK (`lib/li.fi-ts/` — vendored OpenAPI client, not an npm package)
- **EVM → Stellar** (chainId `7`): Allbridge Core SDK (`lib/allbridge/`)
- **EVM → Hedera** (chainId `295` = `0x127`): Hashport SDK (`lib/hashport/`)
- **EVM → Aptos** (chainId `12360001`): LayerZero (`lib/layerzero/aptos/`)

Each bridge module implements: `stepBuilder.ts` (route step construction) + `txData.ts` (transaction data).

### Smart Contract

`src/MUWPTransfer.sol` — Ownable+Pausable batch transfer contract. `transfer()` verifies a secp256k1 signature from `MUWP_SIGNER_KEY`, then forwards tokens/ETH to the temp escrow address. Chain registry: `muwp.ts` → `muwpChains`.

### Inngest Workflows (`lib/inngest/`)

1. `initiateTransfer` — waits up to 30 days for user funds, then 15 min for chain confirmation, fires `consumeStep` per route
2. `consumeStep` — executes each bridge/swap step sequentially with retries
3. `terminateAccount` — cleans up KV account on timeout

### SDK (`sdk/`) — `@muwp/sdk`

Built with `tsup`, tested with `vitest`. The SDK is under active refactoring on this branch — **two parallel implementations coexist**:

| Concern | Old (keep for now) | New (being built) |
|---------|-------------------|-------------------|
| HTTP client | `http/HttpClient.ts` | `http/client.ts` |
| Config | top half of `config.ts` (MuwpClientConfig) | bottom half of `config.ts` (BaseSdkConfig) |
| Asset service | `services/AssetService.ts` | `services/asset.ts` (StellarAssetService) |
| Wallet service | `services/WalletService.ts` | `services/wallet.ts` |

`sdk/src/index.ts` exports from both and exposes `MuwpSdk` (the new top-level class) alongside legacy exports. `RouteService`, `SwapService`, and `StellarDexService` are new-implementation only.

The new `HttpClient` (in `client.ts`) takes a config object `{ method, path, body, schema, searchParams }` rather than positional args. The new `WalletService` depends on `RouteService`; the old one was standalone.

### State Persistence

- **Vercel KV** (`lib/kv/store.ts`) — temp account metadata keyed by address
- **Zustand persist** — tx history in `localStorage` under key `routeStore`

## Key Environment Variables

| Variable | Used in |
|----------|---------|
| `MUWP_SIGNER_KEY` | `api/initiate` — secp256k1 private key |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Vercel KV |
| `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` | Inngest |
| `ETHERSCAN_API_KEY` | Foundry forge verification |
| `VULTR_API_KEY` | SST Kubernetes deployment |

## Key Path Aliases

- `@/*` → `MUWP/` root (tsconfig paths)
- `lib/li.fi-ts` — vendored LI.FI OpenAPI client (not an npm package, do not `npm install` it)
- `lib/core/model/CellLike.ts` — shared `Token` and `Chain` interfaces used throughout
