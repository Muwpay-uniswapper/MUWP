# Introduction

MUWP is a multi-token cross-chain swap protocol that lets users swap any combination of EVM tokens into XLM (or other Stellar assets) in a single transaction.

## How It Works

1. **Select tokens** — pick one or more EVM input tokens and a Stellar output asset.
2. **Get a quote** — the `/api/quote` endpoint aggregates routes across LI.FI, Allbridge, Hashport, and LayerZero.
3. **Initiate the swap** — the `/api/initiate` endpoint creates a temporary escrow account secured by a secp256k1 signature.
4. **Send funds** — transfer your tokens to the temp account in a single batch transaction via `MUWPTransfer.transfer()`.
5. **Receive** — Inngest orchestrates the cross-chain route steps and delivers the output to your Stellar address.

## Quick Start (SDK)

```bash
bun add @muwp/sdk
```

```typescript
import { MuwpSdk } from "@muwp/sdk";

const sdk = new MuwpSdk({ baseUrl: "https://muwp.xyz" });

const quote = await sdk.wallets.fetchQuote({
  inputTokens: [
    { address: "0xusdc...", value: "usdc" },
    { address: "0xusdt...", value: "usdt" },
  ],
  outputTokens: [{ address: "stellar:XLM", value: "xlm" }],
  distribution: [50, 50],
  inputChain: 1,
  outputChain: 7,
  inputAmount: { usdc: 500_000_000n, usdt: 500_000_000n },
  fromAddress: "0xYourEthAddress",
});

console.log("Temp account:", quote.tempAccount);
```
