# @muwp/sdk

TypeScript SDK for MUWP — multi-token cross-chain swaps to Stellar XLM.

## Installation

```bash
npm install @muwp/sdk
# or
bun add @muwp/sdk
```

## Quick Start

```typescript
import { MuwpSdk } from "@muwp/sdk";

const sdk = new MuwpSdk({
  baseUrl: "https://muwp.xyz",  // optional — defaults to production
});

// Request a multi-token quote (2 EVM tokens → XLM on Stellar)
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

### `sdk.wallets` — `WalletService`

Managed wallet and quote orchestration.

```typescript
const quote = await sdk.wallets.fetchQuote(input);
const tempAddr = await sdk.wallets.ensureTempAccount(input);
```

### `sdk.assets` — `StellarAssetService`

Stellar asset lifecycle management.

```typescript
import { StellarAssetService } from "@muwp/sdk";
import { Networks } from "@stellar/stellar-sdk";

const assets = new StellarAssetService({
  horizonUrl: "https://horizon.stellar.org",
  networkPassphrase: Networks.PUBLIC,
});

// Unsigned trustline XDR (user must sign + submit)
const xdr = await assets.buildTrustlineTransaction({
  account: "GABC...", assetCode: "USDC", issuer: "GDEF...",
});

// Signed issuance XDR
const xdr = await assets.buildIssuanceTransaction({
  issuerSecret: "SABC...", destination: "GABC...",
  assetCode: "USDC", amount: "100", memo: "optional",
});

// Account balances
const balances = await assets.fetchBalances("GABC...");
// → [{ assetCode: "XLM", isNative: true, balance: "100.5" }, ...]

// Bridge amount estimate
const estimate = await assets.estimateBridgeAmount({
  fromChainId: 1, fromTokenAddress: "0xusdc...", amount: 1_000_000n,
});
```

### `StellarDexService`

Stellar DEX orderbook and market orders.

```typescript
import { StellarDexService } from "@muwp/sdk";

const dex = new StellarDexService({
  horizonUrl: "https://horizon.stellar.org",
  networkPassphrase: Networks.PUBLIC,
});

const book = await dex.fetchOrderbook({
  selling: { code: "USDC", issuer: "GDEF..." },
});

const result = await dex.swapToXlm({
  selling: { code: "USDC", issuer: "GDEF..." },
  amount: "100",
  accountSecret: "SABC...",
});
// → { hash: "...", acceptedPrice: 0.48 }
```

### `SwapService`

Full EVM → Stellar swap orchestration with performance metrics.

```typescript
import { SwapService } from "@muwp/sdk";

const swapper = new SwapService({ routeService, walletService, stellarDex });

const result = await swapper.executeSwap({
  quote, chainId: 1, gasPayer: "0x...",
  signer: async (txData) => { /* sign + submit EVM tx, return hash */ },
  stellarSecret: "SABC...", stellarAssetCode: "USDC", stellarIssuer: "GDEF...",
});

console.log(result.metrics);
// → { initiate: 243, sign: 890, notifyReceive: 118, stellarSwap: 340 }
```

## Configuration

| Option | Default | Description |
|--------|---------|-------------|
| `baseUrl` | `https://muwp.xyz` | MUWP API base URL |
| `apiKey` | — | Optional API key |
| `fetch` | `cross-fetch` | Custom fetch implementation |
| `assetOptions.horizonUrl` | `https://horizon.stellar.org` | Horizon endpoint |
| `assetOptions.networkPassphrase` | `Networks.PUBLIC` | Stellar network |
| `assetOptions.sorobanUrl` | — | Optional Soroban RPC URL |

## Examples

```bash
bun run examples/01-asset-management.ts   # trustlines, issuance, balances
bun run examples/02-stellar-dex.ts        # orderbook, market orders
bun run examples/03-multi-token-swap.ts   # multi-token EVM → XLM
```

## Development

```bash
bun run build        # compile to dist/
bun run test         # 19 tests across 5 suites
bunx tsc --noEmit    # type check
```

## Grant Context

This SDK is the core deliverable for the [MUWPAY Stellar Community Fund grant (#40)](../../docs/README.md). Full milestone documentation is in [`docs/`](../../docs/).
