# @muwp/sdk

TypeScript SDK for MUWP — multi-token cross-chain swaps to Stellar XLM.

## Installation

```bash
bun add @muwp/sdk
# or
npm install @muwp/sdk
```

## Quick Start

```typescript
import { MuwpSdk } from "@muwp/sdk";

const sdk = new MuwpSdk({
  baseUrl: "https://muwp.xyz",  // optional — defaults to production
});

const quote = await sdk.wallets.fetchQuote({
  inputTokens: [
    { address: "0xusdc...", value: "usdc" },
    { address: "0xusdt...", value: "usdt" },
  ],
  outputTokens: [{ address: "stellar:XLM", value: "xlm" }],
  distribution: [50, 50],
  inputChain: 1,    // Ethereum mainnet
  outputChain: 7,   // Stellar
  inputAmount: { usdc: 500_000_000n, usdt: 500_000_000n },
  fromAddress: "0xYourEthAddress",
});

console.log("Temp account:", quote.tempAccount);
```

## Services

### `sdk.wallets` — WalletService

Managed wallet and quote orchestration.

```typescript
const quote = await sdk.wallets.fetchQuote(input);
const tempAddr = await sdk.wallets.ensureTempAccount(input);
```

### `sdk.assets` — StellarAssetService

Stellar asset lifecycle management.

```typescript
import { StellarAssetService } from "@muwp/sdk";
import { Networks } from "@stellar/stellar-sdk";

const assets = new StellarAssetService({
  horizonUrl: "https://horizon.stellar.org",
  networkPassphrase: Networks.PUBLIC,
});

const balances = await assets.fetchBalances("GADDRESS...");
```

### `sdk.dex` — StellarDexService

Stellar DEX orderbook and market sell operations.

```typescript
const orderbook = await sdk.dex.fetchOrderbook({ buying: "XLM", selling: "USDC" });
const tx = await sdk.dex.swapToXlm({ asset: "USDC", amount: "100" });
```

### `RouteService`

Cross-chain route selection across all supported bridges.

```typescript
const routes = await sdk.routes.selectRoutes({ from: 1, to: 7, token: "USDC", amount: "500" });
```

## Running Tests

```bash
cd packages/sdk
bun run test                                        # all tests
bunx vitest run tests/asset.spec.ts                # StellarAssetService
bunx vitest run tests/dex.spec.ts                  # StellarDexService
bunx vitest run tests/swap.spec.ts                 # SwapService
bunx vitest run tests/wallet.spec.ts               # WalletService
bunx vitest run tests/quote.spec.ts                # RouteService
```

## Deliverables

- [Core SDK (Deliverable 1)](./milestone-1/deliverable-1-sdk)
- [Multi-Token Swap (Deliverable 2)](./milestone-1/deliverable-2-swap)

## Architecture

- [Stellar Architecture](./architecture/stellar-architecture)
- [Technical Feasibility](./architecture/technical-feasibility)
- [Glossary](./architecture/glossary)
