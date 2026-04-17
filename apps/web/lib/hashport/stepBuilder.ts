// FinalStellarStepBuilder.ts

import { EvmBridgeStep, HashportApiClient } from '@hashport/sdk';
import { nanoid } from "nanoid";
import { type Step, StepTypeEnum } from "@muwp/lifi-client";
import { tokenGet } from "../core/data/tokenLib";
import { Address, createPublicClient, encodeFunctionData, extractChain, formatUnits, http, toBytes, toHex, zeroAddress } from "viem";
import { muwpChains } from '@/muwp';
import { getTokensHashportBridge } from './omnichain';

export async function FinalHashportStepBuilder(
  {
    target,
    fromChainId,
    toChainId,
    fromTokenAddress,
    fromTokenImage,
    toTokenImage,
    fromAmount,
    fromAddress,
    toAddress,
  }: {
    target: `0x${string}` | string;
    fromChainId: number;
    toChainId: number;
    fromTokenAddress: `0x${string}` | string;
    fromTokenImage?: string;
    toTokenImage?: string;
    fromAmount: string;
    fromAddress: `0x${string}` | string;
    toAddress: `0x${string}` | string;
  }
): Promise<Step> {
  const client = createPublicClient({
    chain: extractChain({
      chains: muwpChains,
      //@ts-expect-error - chain id are strictly typed, not just numbers.
      id: fromChainId,
    }),
    transport: fromChainId == 1 ? http("https://ultra-convincing-snowflake.quiknode.pro/3595d9810284be8e56eaa7a9093090ca62b5ad90/") : http(),
  });

  const hashportApiClient = new HashportApiClient('mainnet');

  const quote = await hashportApiClient.bridge({
    sourceAssetId: fromTokenAddress,
    tokenId: target,
    sourceNetworkId: fromChainId.toString(),
    targetNetworkId: toChainId.toString(),
    recipient: toAddress,
    amount: fromAmount as unknown as undefined,
  });

  // Quote should be 4 steps
  if (quote.length !== 4) {
    throw new Error("Quote should be 4 steps");
  }

  const actualQuote = quote[2]; // Quote is in the format [Poll from Hedera, Approve, Swap, Poll to Hedera]
  // Check if the quote is valid
  if (actualQuote.type !== "evm" || !actualQuote.amount) {
    throw new Error("Quote is not valid");
  }

  const hashportFees = 0.005; // Hashport fees are hardcoded to 0.5%
  const amountToBeReceived = BigInt(actualQuote.amount);
  const amountToBeReceivedMinusFee = amountToBeReceived * BigInt(1000 * (1 - hashportFees)) / BigInt(1000);

  if (amountToBeReceivedMinusFee < 0) {
    throw new Error("Amount to be received is less than 0");
  }

  const steps: Step[] = [];

  const sourceToken = await tokenGet(fromChainId, fromTokenAddress);
  const destinationToken = await getTokensHashportBridge().then(tokens => tokens.tokens?.find(token => token.address === target));
  const nativeToken = await tokenGet(fromChainId, zeroAddress);
  if (!sourceToken || !destinationToken) {
    throw new Error(`Tokens not supported on the given chains. Source token: ${sourceToken}, destination token: ${destinationToken}`);
  }

  const fromAmountFloat = formatUnits(BigInt(fromAmount), sourceToken.decimals);
  const abi = [{ "inputs": [{ "internalType": "uint256", "name": "_targetChain", "type": "uint256" }, { "internalType": "address", "name": "_nativeToken", "type": "address" }, { "internalType": "uint256", "name": "_amount", "type": "uint256" }, { "internalType": "bytes", "name": "_receiver", "type": "bytes" }], "name": "lock", "outputs": [], "stateMutability": "nonpayable", "type": "function" }] as const; //JSON.parse(actualQuote.abi)

  console.log([
    BigInt(toChainId), // _targetChain - should be the actual target chain ID
    fromTokenAddress as `0x${string}`, // _nativeToken address
    BigInt(fromAmount), // _amount
    toHex(toBytes(toAddress)), // _receiver as bytes - use proper encoding
  ]);

  const gasEstimate = await client.estimateGas({
    account: fromAddress as Address,
    to: actualQuote.target as `0x${string}`,
    // Remove the value parameter since the function is not payable
    data: encodeFunctionData({
      abi,
      functionName: 'lock',
      args: [
        BigInt(toChainId), // _targetChain - should be the actual target chain ID
        fromTokenAddress as `0x${string}`, // _nativeToken address
        0n, // _amount = 0 - so that we can get the gas estimate
        toHex(toBytes(toAddress)), // _receiver as bytes - use proper encoding
      ]
    })
  });

  const gasPrice = await client.getGasPrice();
  const fullGasEstimate = gasEstimate * gasPrice * 3n; // Triple the gas estimate, because I absolutely have no idea how much gas is needed

  const gasFeeAmountUSD = Number(fullGasEstimate * BigInt(Math.round(Number(nativeToken.priceUSD ?? "1") * 1e9)) / 10n ** 18n) / 1e9;

  // Get average transfer time - 1 minute
  const transferTimeMs = 1000 * 60;

  const executionDuration = (transferTimeMs ?? 1000000) / 1000; // Convert ms to seconds

  // Fee Costs are fromAmount - toAmount
  const abs = (a: bigint, b: bigint) => (a > b ? a - b : b - a);
  const feeCosts = abs(amountToBeReceivedMinusFee, amountToBeReceived);
  const feeCostsFloat = Number(formatUnits(feeCosts, sourceToken.decimals));
  const feeCostsUSD = feeCostsFloat;
  const approvalQuote = quote[1] as EvmBridgeStep;
  if (!approvalQuote.spender) {
    throw new Error("Spender address is not available");
  }
  const approvalAddress = approvalQuote.spender;

  // Add send step
  steps.push({
    id: nanoid(),
    type: StepTypeEnum.Cross,
    action: {
      fromAmount: fromAmount,
      fromChainId: fromChainId,
      fromToken: {
        address: sourceToken.address,
        symbol: sourceToken.symbol,
        decimals: sourceToken.decimals,
        chainId: fromChainId,
        name: sourceToken.name,
        logoURI: fromTokenImage,
      },
      toChainId: toChainId,
      toToken: {
        address: destinationToken.address,
        symbol: destinationToken.symbol,
        decimals: destinationToken.decimals,
        chainId: toChainId,
        name: destinationToken.name,
        logoURI: toTokenImage,
      },
      fromAddress: fromAddress,
      toAddress: toAddress,
      slippage: 0.005,
    },
    estimate: {
      approvalAddress,
      fromAmount: fromAmount,
      toAmount: amountToBeReceived.toString(),
      toAmountMin: amountToBeReceived.toString(), // Adjust for slippage if needed
      tool: "Allbridge",
      feeCosts: [
        {
          amount: feeCosts.toString(),
          amountUSD: feeCostsUSD.toString(),
          included: true,
          name: "AllBridge Fee",
          percentage: (
            (Number(feeCosts) / Number(fromAmount)) *
            100
          ).toString(),
          token: sourceToken,
          description: "Fee for transaction",
        },
      ],
      executionDuration: executionDuration,
      gasCosts: [
        {
          amount: fullGasEstimate.toString(),
          type: "SEND",
          token: nativeToken,
          amountUSD: gasFeeAmountUSD.toString(),
          estimate: fullGasEstimate.toString(),
          price: gasPrice.toString(), // Need to get gas price if available
        },
      ],
    },
    tool: "Hashport",
    toolDetails: {
      key: "hashport",
      name: "Hashport",
      logoURI:
        "https://muwp.xyz/icons/hashport.svg",
    },
  });

  // Return the final step
  return steps[steps.length - 1];
}
