# Architecture

## Repository Layout

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router — pages, API routes, layouts |
| `components/` | React UI components (swap card, ReactFlow graph, modals) |
| `lib/` | Core business logic — bridge adapters (LI.FI, Allbridge, Hashport, LayerZero), Zustand stores, Inngest workflows, KV client |
| `backend/` | Server-side helpers, Uniswap V2/V3 quote backend |
| `sdk/` | `@muwp/sdk` — standalone TypeScript package built with tsup |
| `src/` | Solidity smart contracts (`MUWPTransfer.sol`) |
| `script/` | Foundry deployment scripts (`Deploy.s.sol`) |
| `test/` | Foundry Solidity tests |
| `tests/` | Playwright end-to-end tests |
| `public/` | Static assets served by Next.js |
| `docs/` | VitePress documentation site (this site) |
| `kv/` | Vercel KV helpers and type definitions |
| `broadcast/` | Foundry broadcast logs from on-chain deployments |
| `certificates/` | Local HTTPS certificates for `next dev --experimental-https` |
| `out/` | Foundry compilation output (generated, not committed) |

## Frontend

The Next.js 16 App Router entry point is `app/page.tsx` → `components/swapcard.tsx`.

Two Zustand stores drive the swap UI:
- **`swapStore`** — ephemeral UI state (tokens, amounts, sliders, bridge allow/deny lists)
- **`routeStore`** — fetched routes, tx history (persisted to `localStorage`), wallet config, ReactFlow viewport

Routes are rendered as an interactive ReactFlow graph (`components/flow/MainFlow.tsx`). Each edge is a bridge/DEX hop.

## API Routes

| Route | Purpose |
|-------|---------|
| `api/quote` | Aggregates routes — **streamed JSON** to bypass Vercel timeouts |
| `api/initiate` | Validates KV temp account, computes gas, encodes calldata with secp256k1 sig |
| `api/receive-funds` | Called after user sends to temp account |
| `api/chain-confirmed` | Called after on-chain confirmation |
| `api/status` | Polling endpoint |
| `api/inngest` | Inngest webhook handler |

## Bridge Routing

Output chain determines the bridge handler:

| Route | Handler |
|-------|---------|
| EVM → EVM | LI.FI SDK |
| EVM → Stellar (chainId `7`) | Allbridge Core SDK |
| EVM → Hedera (chainId `295`) | Hashport SDK |
| EVM → Aptos (chainId `12360001`) | LayerZero |

## Smart Contract

`src/MUWPTransfer.sol` — Ownable+Pausable batch transfer contract. `transfer()` verifies a secp256k1 signature from `MUWP_SIGNER_KEY`, then forwards tokens/ETH to the temp escrow address.

## Inngest Workflows

1. `initiateTransfer` — waits up to 30 days for user funds, then 15 min for chain confirmation
2. `consumeStep` — executes each bridge/swap step sequentially with retries
3. `terminateAccount` — cleans up KV account on timeout
