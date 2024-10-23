// FinalStellarStepBuilder.ts

import {
	AllbridgeCoreSdk,
	nodeRpcUrlsDefault,
	ChainSymbol,
	Messenger,
} from "@allbridge/bridge-core-sdk";
import { nanoid } from "nanoid";
import { type Step, StepTypeEnum } from "@/lib/li.fi-ts";
import { tokenGet } from "../core/data/tokenLib";
import { zeroAddress } from "viem";

export async function FinalAllbridgeStepBuilder({
	target,
	fromChainId,
	fromTokenAddress,
	fromAmount,
	fromAddress,
	toAddress,
}: {
	target: `0x${string}` | string;
	fromChainId: number;
	fromTokenAddress: `0x${string}` | string;
	fromAmount: string;
	fromAddress: `0x${string}` | string;
	toAddress: `0x${string}` | string;
}): Promise<Step> {
	// Initialize the Allbridge SDK
	const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

	// Get chain details
	const chainDetailsMap = await sdk.chainDetailsMap();

	// Map fromChainId to ChainSymbol
	const chainIdToSymbol: { [key: number]: ChainSymbol } = {};
	for (const chainSymbol in chainDetailsMap) {
		const chainDetails = chainDetailsMap[chainSymbol as ChainSymbol];
		chainIdToSymbol[Number(chainDetails.chainId)] =
			chainSymbol as ChainSymbol;
	}

	const fromChainSymbol = chainIdToSymbol[fromChainId];
	const toChainSymbol = ChainSymbol.STLR; // Stellar

	if (!fromChainSymbol) {
		throw new Error(`Unsupported fromChainId: ${fromChainId}`);
	}

	const sourceChain = chainDetailsMap[fromChainSymbol];
	const destinationChain = chainDetailsMap[toChainSymbol];

	// Get tokens
	const sourceToken = sourceChain.tokens.find(
		(tokenInfo) =>
			tokenInfo.tokenAddress.toLowerCase() ===
			fromTokenAddress.toLowerCase(),
	);

	const destinationToken = destinationChain.tokens.find(
		(tokenInfo) =>
			tokenInfo.tokenAddress.toLowerCase() === target.toLowerCase(),
	);

	if (!sourceToken || !destinationToken) {
		throw new Error("Tokens not supported on the given chains");
	}

	const steps: Step[] = [];

	// Estimate amount to be received
	const amountToBeReceived = await sdk.getAmountToBeReceived(
		fromAmount,
		sourceToken,
		destinationToken,
	);

	// Get gas fee options
	const gasFeeOptions = await sdk.getGasFeeOptions(
		sourceToken,
		destinationToken,
		Messenger.ALLBRIDGE,
	);

	// Assume we pay gas fee in native currency
	const gasFee = BigInt(gasFeeOptions.native.int);

	// Get native token info
	const nativeToken = await tokenGet(fromChainId, zeroAddress);

	// Compute gas fee amount in USD
	const gasFeeAmountUSD = Number(gasFeeOptions.stablecoin?.float);

	// Get average transfer time
	const transferTimeMs = sdk.getAverageTransferTime(
		sourceToken,
		destinationToken,
		Messenger.ALLBRIDGE,
	);

	const executionDuration = (transferTimeMs ?? 1000000) / 1000; // Convert ms to seconds

	// // Build send transaction
	// const rawTransactionSend = await sdk.bridge.rawTxBuilder.send({
	// 	amount: fromAmount,
	// 	fromAccountAddress: fromAddress,
	// 	toAccountAddress: toAddress,
	// 	sourceToken: sourceToken,
	// 	destinationToken: destinationToken,
	// 	messenger: Messenger.ALLBRIDGE,
	// });

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
			},
			toChainId: Number(destinationChain.chainId),
			toToken: {
				address: destinationToken.tokenAddress,
				symbol: destinationToken.symbol,
				decimals: destinationToken.decimals,
				chainId: Number(destinationChain.chainId),
				name: destinationToken.name,
			},
			fromAddress: fromAddress,
			toAddress: toAddress,
			slippage: 0,
		},
		estimate: {
			fromAmount: fromAmount,
			toAmount: amountToBeReceived,
			toAmountMin: amountToBeReceived, // Adjust for slippage if needed
			tool: "Allbridge",
			feeCosts: [
				{
					amount: gasFee.toString(),
					amountUSD: gasFeeAmountUSD.toString(),
					included: true,
					name: "Gas Fee",
					percentage: (
						(Number(gasFee) / Number(fromAmount)) *
						100
					).toString(),
					token: nativeToken,
					description: "Gas fee for transaction",
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
					price: "0", // Need to get gas price if available
				},
			],
		},
		tool: "Allbridge",
		toolDetails: {
			key: "allbridge",
			name: "Allbridge",
			logoURI: "/icons/allbridge.svg",
		},
	});

	// Return the final step
	return steps[steps.length - 1];
}
