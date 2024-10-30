// FinalStellarStepBuilder.ts

import {
	AllbridgeCoreSdk,
	Messenger,
	TokenWithChainDetails,
	ChainDetailsWithTokens,
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
}, {
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
}): Promise<Step> {
	if (!sourceToken || !destinationToken) {
		throw new Error(`Tokens not supported on the given chains. Source token: ${sourceToken}, destination token: ${destinationToken}`);
	}

	const steps: Step[] = [];

	const [amountToBeReceived, gasFeeOptions, nativeToken] = await Promise.all([
		sdk.getAmountToBeReceived(fromAmount, sourceToken, destinationToken),
		sdk.getGasFeeOptions(sourceToken, destinationToken, Messenger.ALLBRIDGE),
		tokenGet(fromChainId, zeroAddress),
	]);

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

	// // Build send transaction
	// const rawTransactionSend = await sdk.bridge.rawTxBuilder.send({
	// 	amount: fromAmount,
	// 	fromAccountAddress: fromAddress,
	// 	toAccountAddress: toAddress,
	// 	sourceToken: sourceToken,
	// 	destinationToken: destinationToken,
	// 	messenger: Messenger.ALLBRIDGE,
	// });


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
			approvalAddress,
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
