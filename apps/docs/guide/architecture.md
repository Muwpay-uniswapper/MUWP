# Architecture

## Repository Layout

```
MUWP/
├── apps/
│   ├── web/          Next.js 16 frontend + API routes
│   └── docs/         VitePress documentation (this site)
├── packages/
│   ├── sdk/          @muwp/sdk — TypeScript SDK (tsup)
│   ├── kv/           Vercel KV helpers and type definitions
│   └── lifi-client/  Generated LI.FI OpenAPI client
└── contracts/        Foundry — Solidity smart contracts
    ├── src/          MUWPTransfer.sol
    ├── script/       Deploy.s.sol
    ├── test/         Solidity tests
    └── broadcast/    On-chain deployment logs
```

Inside `apps/web/`:

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router — pages, API routes, layouts |
| `components/` | React UI components (swap card, ReactFlow graph, modals) |
| `lib/` | Core business logic — bridge adapters (LI.FI, Allbridge, Hashport, LayerZero), Zustand stores, Inngest workflows |
| `public/` | Static assets served by Next.js |
| `e2e/` | Playwright end-to-end tests |
| `certificates/` | Local HTTPS certificates for `next dev --experimental-https` |

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

`contracts/src/MUWPTransfer.sol` — Ownable+Pausable batch transfer contract. `transfer()` verifies a secp256k1 signature from `MUWP_SIGNER_KEY`, then forwards tokens/ETH to the temp escrow address.

## Inngest Workflows

1. `initiateTransfer` — waits up to 30 days for user funds, then 15 min for chain confirmation
2. `consumeStep` — executes each bridge/swap step sequentially with retries
3. `terminateAccount` — cleans up KV account on timeout
