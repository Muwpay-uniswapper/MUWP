import { Step } from "@/lib/li.fi-ts";
import { HashportApiClient } from '@hashport/sdk';
import { encodeFunctionData, toHex, toBytes } from "viem";

export async function HashportTxData(step: Step): Promise<Step> {
	// Initialize Hashport client
	const hashportApiClient = new HashportApiClient('mainnet');

	// Get the bridge quote
	const quote = await hashportApiClient.bridge({
		sourceAssetId: step.action.fromToken.address,
		tokenId: step.action.toToken.address,
		sourceNetworkId: step.action.fromChainId.toString(),
		targetNetworkId: step.action.toChainId.toString(),
		recipient: step.action.toAddress!,
		amount: step.action.fromAmount as unknown as undefined,
	});

	// Quote should be 4 steps
	if (quote.length !== 4) {
		throw new Error("Quote should be 4 steps");
	}

	const actualQuote = quote[2]; // Get the swap step

	// Check if the quote is valid
	if (actualQuote.type !== "evm" || !actualQuote.amount) {
		throw new Error("Quote is not valid");
	}

	// Define the ABI for the lock function
	const abi = [{
		"inputs": [
			{ "internalType": "uint256", "name": "_targetChain", "type": "uint256" },
			{ "internalType": "address", "name": "_nativeToken", "type": "address" },
			{ "internalType": "uint256", "name": "_amount", "type": "uint256" },
			{ "internalType": "bytes", "name": "_receiver", "type": "bytes" }
		],
		"name": "lock",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}] as const;

	// Encode the transaction data
	const txData = encodeFunctionData({
		abi,
		functionName: 'lock',
		args: [
			BigInt(step.action.toChainId),
			step.action.fromToken.address as `0x${string}`,
			BigInt(step.action.fromAmount),
			toHex(toBytes(step.action.toAddress!)),
		]
	});

	// Return the step with transaction request
	return {
		...step,
		transactionRequest: {
			from: step.action.fromAddress,
			to: actualQuote.target as `0x${string}`,
			data: txData,
			chainId: step.action.fromChainId,
			value: "0x0" // Set to 0 since we're not sending native tokens
		}
	};
}
