# MUWP SDK

TypeScript toolkit for building MUWP-powered experiences. The SDK wraps wallet orchestration, asset management, Stellar DEX utilities, and a multi-token swap prototype that targets XLM.

## Installation

```bash
npm install @muwp/sdk
```

## Quick start

```ts
import { MuwpClient, SwapService } from "@muwp/sdk";

const client = new MuwpClient({ baseUrl: "https://muwp.xyz" });
const swapper = new SwapService(client);

const quote = await swapper.quoteToStellar({
  inputTokens: [
    { address: "0x0000...", value: "ETH:ETH:0x0000..." },
    { address: "0xA0b8...", value: "USDC:USD Coin:0xA0b8..." }
  ],
  outputToken: { address: "stellar:XLM", value: "XLM" },
  inputChain: 1,
  outputChain: 7,
  inputAmount: {
    "ETH:ETH:0x0000...": "2000000000000000000",
    "USDC:USD Coin:0xA0b8...": "1000000"
  },
  distribution: [60, 40],
  fromAddress: "0xFrom",
  toAddress: "0xTo"
});

const txn = await swapper.executeSwap({
  quote,
  gasPayer: "0xFrom",
  signer: async (payload) => walletClient.sendTransaction(payload)
});
```

More examples live in [`examples/`](./examples). Architectural details sit in [`docs/README.md`](./docs/README.md).