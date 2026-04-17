# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Layout

```
muwp/                          # monorepo root (this directory)
├── apps/
│   ├── web/                   # Next.js 16 app (@muwp/web)
│   └── docs/                  # VitePress documentation (@muwp/docs)
├── packages/
│   ├── sdk/                   # TypeScript SDK (@muwp/sdk, tsup + vitest)
│   ├── kv/                    # Cloudflare Worker KV proxy
│   └── lifi-client/           # Vendored LI.FI OpenAPI TS client (@muwp/lifi-client)
├── contracts/                 # Foundry — NOT a Bun workspace
│   ├── src/MUWPTransfer.sol
│   ├── script/ test/
│   ├── lib/forge-std/         # git submodule
│   └── lib/openzeppelin-contracts/  # git submodule
├── turbo.json
├── package.json               # root — turbo + prettier only
└── bun.lock                   # text lockfile (bun 1.2+)
```

## Commands

All commands run from the **monorepo root** unless noted.

```bash
# Development
bun run dev                          # turbo run dev (all workspaces)
bun run dev --filter=@muwp/web       # Next.js only (HTTPS required for wallet adapters)
bun run dev --filter=@muwp/docs      # VitePress only

# Production build
bun run build                        # turbo run build (all workspaces)
bun run build --filter=@muwp/web     # Next.js only

# Lint / Typecheck
bun run lint
bun run typecheck

# SDK (from packages/sdk/)
cd packages/sdk
bun run build        # tsup — outputs to dist/
bun test             # vitest run (all tests)
bun test tests/quote.spec.ts   # single test file
biome check .        # lint SDK (Biome only, not ESLint)

# Integration tests (from apps/web/)
cd apps/web
bun test test-back lib/allbridge lib/hashport

# Smart contracts (from contracts/)
cd contracts
forge build
forge test
forge test --match-test testName

# Playwright e2e (from apps/web/)
cd apps/web
bunx playwright test
```

**Package manager**: Bun `1.3.10` (pinned via `packageManager` in root `package.json`).

## Architecture Overview

### Frontend — `apps/web/` (Next.js 16 App Router)

Entry point: `apps/web/app/page.tsx` → `apps/web/components/swapcard.tsx`.

Two Zustand stores drive the swap UI:
- `lib/core/data/swapStore.ts` — ephemeral UI state (tokens, amounts, sliders, bridge allow/deny lists)
- `lib/core/data/routeStore.ts` — fetched routes, tx history (persisted via `zustand/middleware/persist`), wallet config, ReactFlow viewport

Routes are rendered as an interactive ReactFlow graph in `components/flow/MainFlow.tsx`. Each edge is a bridge/DEX hop; clicking zooms into a `DetailNode`.

### API Routes (`apps/web/app/api/`)

| Route | Purpose |
|-------|---------|
| `quote` | Aggregates across LI.FI, Allbridge, Hashport, LayerZero — **streamed JSON** to bypass Vercel timeouts |
| `initiate` | Validates KV temp account, computes gas, encodes `MUWPTransfer.transfer()` calldata with secp256k1 sig, fires Inngest event |
| `receive-funds` | Called after user sends to temp account |
| `chain-confirmed` | Called after on-chain confirmation |
| `status` | Polling endpoint |
| `recover-funds` | Triggers recovery flow |
| `inngest` | Inngest webhook handler |
| `uniswap` | Uniswap V2/V3 quote (lib in `lib/uniswap/`) |

### Bridge Routing (`/api/quote` dispatch)

Output chain determines the bridge handler:
- **EVM → EVM**: LI.FI SDK (`packages/lifi-client/` — vendored OpenAPI client, not an npm install)
- **EVM → Stellar** (chainId `7`): Allbridge Core SDK (`lib/allbridge/`)
- **EVM → Hedera** (chainId `295` = `0x127`): Hashport SDK (`lib/hashport/`)
- **EVM → Aptos** (chainId `12360001`): LayerZero (`lib/layerzero/aptos/`)

Each bridge module implements: `stepBuilder.ts` (route step construction) + `txData.ts` (transaction data).

### Smart Contract — `contracts/`

`contracts/src/MUWPTransfer.sol` — Ownable+Pausable batch transfer contract. `transfer()` verifies a secp256k1 signature from `MUWP_SIGNER_KEY`, then forwards tokens/ETH to the temp escrow address. Chain registry: `apps/web/muwp.ts` → `muwpChains`.

`contracts/` is NOT in Bun workspaces. Run `forge` commands from within `contracts/`.

### Inngest Workflows (`apps/web/lib/inngest/`)

1. `initiateTransfer` — waits up to 30 days for user funds, then 15 min for chain confirmation, fires `consumeStep` per route
2. `consumeStep` — executes each bridge/swap step sequentially with retries
3. `terminateAccount` — cleans up KV account on timeout

### SDK — `packages/sdk/` (`@muwp/sdk`)

Built with `tsup`, tested with `vitest`, linted with Biome. Two parallel implementations coexist during refactor:

| Concern | Old (keep for now) | New (being built) |
|---------|-------------------|-------------------|
| HTTP client | `http/HttpClient.ts` | `http/client.ts` |
| Config | top half of `config.ts` (MuwpClientConfig) | bottom half of `config.ts` (BaseSdkConfig) |
| Asset service | `services/AssetService.ts` | `services/asset.ts` (StellarAssetService) |
| Wallet service | `services/WalletService.ts` | `services/wallet.ts` |

`src/index.ts` exports from both and exposes `MuwpSdk` (the new top-level class) alongside legacy exports. `RouteService`, `SwapService`, and `StellarDexService` are new-implementation only.

### State Persistence

- **Vercel KV** (`apps/web/lib/kv/store.ts`) — temp account metadata keyed by address
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

- `@/*` → `apps/web/` root (tsconfig paths in `apps/web/tsconfig.json`)
- `packages/lifi-client/` — vendored LI.FI OpenAPI client (do NOT `bun add` it, it is a local workspace)
- `apps/web/lib/core/model/CellLike.ts` — shared `Token` and `Chain` interfaces used throughout
