import {
  MuwpClient,
  SwapService,
  SwapSignerPayload,
} from "@muwp/sdk";

async function main() {
  const client = new MuwpClient({
    baseUrl: "https://muwp.xyz",
    stellar: {
      horizonUrl: "https://horizon.stellar.org",
      networkPassphrase: "Public Global Stellar Network ; September 2015",
    },
  });

  const swapper = new SwapService({
    routeService: client.routes,
    walletService: client.wallets,
    stellarDex: client.stellarDex,
  });

  const quote = await swapper.quoteToStellar({
    inputTokens: [
      {
        address: "0x0000000000000000000000000000000000000000",
        value: "ETH:ETH:0x0000000000000000000000000000000000000000",
      },
      {
        address: "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        value: "USDC:USD Coin:0xA0b86991c6218b36c1d19d4a2e9Eb0cE3606eB48",
      },
    ],
    outputTokens: [
      {
        address: "stellar:AllbridgeUSD",
        value: "AllbridgeUSD",
      },
    ],
    distribution: [50, 50],
    inputChain: 1,
    outputChain: 7,
    inputAmount: {
      "ETH:ETH:0x0000000000000000000000000000000000000000":
        "1000000000000000000",
      "USDC:USD Coin:0xA0b86991c6218b36c1d19d4a2e9Eb0cE3606eB48": "1000000",
    },
    fromAddress: "0x27b4A938802b1278317eD0fC0135b6E1E14F43dC",
    toAddress: "0x27b4A938802b1278317eD0fC0135b6E1E14F43dC",
    ensureMultiInput: true,
  });

  const fakeSigner = async (payload: SwapSignerPayload) => {
    console.log("Would sign payload", payload);
    return "0xfakehash";
  };

  const execution = await swapper.executeSwap({
    quote,
    chainId: 1,
    gasPayer: "0x27b4A938802b1278317eD0fC0135b6E1E14F43dC",
    signer: fakeSigner,
    stellarSecret: "SBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    stellarAssetCode: "AllbridgeUSD",
    stellarIssuer: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  });

  console.log(execution.metrics);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

