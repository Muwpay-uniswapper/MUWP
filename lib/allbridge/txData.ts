import { Step } from "@/lib/li.fi-ts";


import {
	AllbridgeCoreSdk,
	nodeRpcUrlsDefault,
	ChainSymbol,
	Messenger,
	RawEvmTransaction,
} from "@allbridge/bridge-core-sdk";
import { toHex } from "viem";

export async function AllBridgeTxData(step: Step): Promise<Step> {
	// Initialize the Allbridge SDK
	const sdk = new AllbridgeCoreSdk({
		[ChainSymbol.ETH]: "https://cloudflare-eth.com",
		[ChainSymbol.BSC]: "https://bsc-dataseed.binance.org",
		[ChainSymbol.BAS]: "https://mainnet.base.org",
		[ChainSymbol.SOL]: "https://api.mainnet-beta.solana.com",
		[ChainSymbol.TRX]: "https://api.trongrid.io",
		[ChainSymbol.POL]: "https://polygon-rpc.com",
		[ChainSymbol.ARB]: "https://arb1.arbitrum.io/rpc",
		[ChainSymbol.CEL]: "https://forno.celo.org",
		[ChainSymbol.AVA]: "https://api.avax.network/ext/bc/C/rpc",
		[ChainSymbol.SRB]: "https://rpc.soroban.stellar.org",
		[ChainSymbol.STLR]: "https://horizon.stellar.org",
		[ChainSymbol.OPT]: "https://mainnet.optimism.io",
		...nodeRpcUrlsDefault
	});

	// Get chain details
	const chainDetailsMap = await sdk.chainDetailsMap();

	// Map fromChainId to ChainSymbol
	const chainIdToSymbol: { [key: number]: ChainSymbol } = {};
	for (const chainSymbol in chainDetailsMap) {
		const chainDetails = chainDetailsMap[chainSymbol as ChainSymbol];
		chainIdToSymbol[Number(chainDetails.chainId)] =
			chainSymbol as ChainSymbol;
	}

	const fromChainSymbol = chainIdToSymbol[step.action.fromChainId];
	const toChainSymbol = ChainSymbol.STLR; // Stellar

	if (!fromChainSymbol) {
		throw new Error(`Unsupported fromChainId: ${step.action.fromChainId}`);
	}

	const sourceChain = chainDetailsMap[fromChainSymbol];
	const destinationChain = chainDetailsMap[toChainSymbol] || chainDetailsMap[ChainSymbol.SRB];

	// Get tokens
	const sourceToken = sourceChain.tokens.find(
		(tokenInfo) =>
			tokenInfo.tokenAddress.toLowerCase() ===
			step.action.fromToken.address.toLowerCase(),
	);

	const destinationToken = destinationChain.tokens.find(
		(tokenInfo) =>
			tokenInfo.tokenAddress.toLowerCase() === step.action.toToken.address.toLowerCase(),
	);

	if (!sourceToken || !destinationToken) {
		throw new Error("Tokens not supported on the given chains");
	}

	const txRequest: RawEvmTransaction = await sdk.bridge.rawTxBuilder.send({
		amount: step.action.fromAmount,
		fromAccountAddress: step.action.fromAddress ?? "",
		toAccountAddress: step.action.toAddress ?? "",
		sourceToken,
		destinationToken,
		messenger: Messenger.ALLBRIDGE,
	}) as RawEvmTransaction;

	return {
		...step,
		transactionRequest: {
			...txRequest,
			chainId: step.action.fromChainId,
			value: toHex(BigInt(txRequest.value?.toString() ?? 0n))
		}
	}
}
