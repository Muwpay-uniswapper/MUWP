// FinalStellarStepBuilder.ts

import {
  type AllbridgeCoreSdk,
  Messenger,
  type TokenWithChainDetails,
  type ChainDetailsWithTokens,
} from "@allbridge/bridge-core-sdk";
import { nanoid } from "nanoid";
import { type Step, StepTypeEnum } from "@/lib/li.fi-ts";
import { tokenGet } from "../core/data/tokenLib";
import { formatUnits, parseUnits, zeroAddress } from "viem";

export async function FinalAllbridgeStepBuilder(
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
  },
  {
    sourceToken,
    destinationToken,
    destinationChain,
    sdk,
  }: {
    sourceToken: TokenWithChainDetails | undefined;
    destinationToken: TokenWithChainDetails | undefined;
    sourceChain: ChainDetailsWithTokens;
    destinationChain: ChainDetailsWithTokens;
    sdk: AllbridgeCoreSdk;
  },
): Promise<Step> {
  if (!sourceToken || !destinationToken) {
    throw new Error(
      `Tokens not supported on the given chains. Source token: ${sourceToken}, destination token: ${destinationToken}`,
    );
  }

  const steps: Step[] = [];

  const fromAmountFloat = formatUnits(BigInt(fromAmount), sourceToken.decimals);

  const [_amountToBeReceived, gasFeeOptions, nativeToken] = await Promise.all([
    sdk.getAmountToBeReceived(fromAmountFloat, sourceToken, destinationToken),
    sdk.getGasFeeOptions(sourceToken, destinationToken, Messenger.ALLBRIDGE),
    tokenGet(fromChainId, zeroAddress),
  ]);

  const amountToBeReceived = parseUnits(
    _amountToBeReceived,
    destinationToken.decimals,
  );

  // Assume we pay gas fee in native currency
  const gasFee = BigInt(gasFeeOptions.native.int);

  // Compute gas fee amount in USD
  const gasFeeAmountUSD = Number(gasFeeOptions.stablecoin?.float);

  // Get average transfer time
  const transferTimeMs = sdk.getAverageTransferTime(
    sourceToken,
    destinationToken,
    Messenger.ALLBRIDGE,
  );

  const executionDuration = (transferTimeMs ?? 1000000) / 1000; // Convert ms to seconds

  // Fee Costs are fromAmount - toAmount
  const abs = (a: bigint, b: bigint) => (a > b ? a - b : b - a);
  const feeCosts =
    (abs(BigInt(fromAmount), amountToBeReceived) * 10n ** 9n) /
    BigInt(Math.round(Number(nativeToken.priceUSD ?? "1") * 1e9));
  const feeCostsFloat = Number(formatUnits(feeCosts, 8));
  const feeCostsUSD = feeCostsFloat;

  const approvalAddress = sourceToken.bridgeAddress;

  // Add send step
  steps.push({
    id: nanoid(),
    type: StepTypeEnum.Cross,
    action: {
      fromAmount: fromAmount,
      fromChainId: fromChainId,
      fromToken: {
        address: sourceToken.tokenAddress,
        symbol: sourceToken.symbol,
        decimals: sourceToken.decimals,
        chainId: fromChainId,
        name: sourceToken.name,
        logoURI: fromTokenImage,
      },
      toChainId: destinationChain.chainId
        ? Number.parseInt(destinationChain.chainId.split("0x")[1], 16)
        : toChainId,
      toToken: {
        address: destinationToken.tokenAddress,
        symbol: destinationToken.symbol,
        decimals: destinationToken.decimals,
        chainId: destinationChain.chainId
          ? Number.parseInt(destinationChain.chainId.split("0x")[1], 16)
          : toChainId,
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
          token: nativeToken,
          description: "Fee for transaction",
        },
      ],
      executionDuration: executionDuration,
      gasCosts: [
        {
          amount: gasFee.toString(),
          type: "SEND",
          token: nativeToken,
          amountUSD: gasFeeAmountUSD.toString(),
          estimate: gasFee.toString(),
          price: nativeToken.priceUSD, // Need to get gas price if available
        },
      ],
    },
    tool: "Allbridge",
    toolDetails: {
      key: "allbridge",
      name: "Allbridge",
      logoURI:
        "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/bridges/allbridge.png",
    },
  });

  // Return the final step
  return steps[steps.length - 1];
}
