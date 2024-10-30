import type { InputType } from "./route";
import type { Route } from "@/lib/li.fi-ts";
import {
	AllbridgeCoreSdk,
	nodeRpcUrlsDefault,
} from "@allbridge/bridge-core-sdk";
import { nanoid } from "nanoid";
import { FinalAllbridgeStepBuilder } from "@/lib/allbridge/stepBuilder"; // We'll create this
import { handleLiFiRoutes } from "./fetchRoutesLiFi";

// ensure is a function that returns a value or throws an error if the value is undefined or null
function ensure<T>(value: T | undefined): T {
	if (value === undefined || value === null) {
		throw new Error("Value is undefined");
	}
	return value;
}

export async function handleAllbridgeRoutes(
	input: InputType,
	tempAccount: string,
) {
	const mode = input.outputTokens.length > 1 ? "split" : "single";

	const queries = (
		mode === "single" ? input.inputTokens : input.outputTokens
	).map((token) => {
		const req = {
			fromAmount:
				mode === "single"
					? input.inputAmount[token.value]?.toString()
					: (
						(input.inputAmount[input.inputTokens[0].value] *
							BigInt(
								input.distribution[
								input.outputTokens.findIndex(
									(t) =>
										t.address === token.address &&
										t.value === token.value,
								)
								],
							)) /
						100n
					).toString(),
			fromChainId: input.inputChain,
			fromTokenAddress:
				mode === "single"
					? token.address
					: input.inputTokens[0].address,
			toChainId: input.outputChain,
			toTokenAddress:
				mode === "single"
					? input.outputTokens[0].address
					: token.address,
			fromAddress: tempAccount,
			toAddress: input.toAddress ?? input.fromAddress,
			options: input.options,
		};

		return req;
	});

	const rawRoutes = [];

	// Initialize the Allbridge SDK once
	const sdk = new AllbridgeCoreSdk(nodeRpcUrlsDefault);

	// Get chain details and build chain ID to symbol mapping
	const chainDetailsMap = await sdk.chainDetailsMap();
	const chainIdToSymbol: { [key: number]: string } = {};
	for (const chainSymbol in chainDetailsMap) {
		const chainDetails = chainDetailsMap[chainSymbol];
		chainIdToSymbol[chainDetails.chainId ? Number.parseInt(chainDetails.chainId?.split("0x")[1] ?? "", 16) : Number(chainDetails.allbridgeChainId)] = chainSymbol;
	}

	for (const req of queries) {
		const previousRoutes: Route[] = [];

		const fromChainSymbol = chainIdToSymbol[req.fromChainId];
		const toChainSymbol = chainIdToSymbol[req.toChainId];

		if (!fromChainSymbol || !toChainSymbol) {
			throw new Error(
				`No routes available for chain IDs ${req.fromChainId} and ${req.toChainId}`,
			);
		}

		const sourceChain = chainDetailsMap[fromChainSymbol];
		const destinationChain = chainDetailsMap[toChainSymbol];

		// Attempt to find direct tokens on both chains
		let sourceToken = sourceChain.tokens.find(
			(tokenInfo) =>
				tokenInfo.tokenAddress.toLowerCase() ===
				req.fromTokenAddress.toLowerCase(),
		);
		let destinationToken = destinationChain.tokens.find(
			(tokenInfo) =>
				tokenInfo.tokenAddress.toLowerCase() ===
				req.toTokenAddress.toLowerCase(),
		);

		let canBridgeDirectly = false;
		if (
			sourceToken &&
			destinationToken &&
			sourceToken.symbol === destinationToken.symbol
		) {
			canBridgeDirectly = true;
		}

		if (!canBridgeDirectly) {
			// Find a common token that can be bridged
			const sourceTokenSymbols = new Set(
				sourceChain.tokens.map((t) => t.symbol),
			);
			const destinationTokenSymbols = new Set(
				destinationChain.tokens.map((t) => t.symbol),
			);
			const commonSymbols = [...sourceTokenSymbols].filter((symbol) =>
				destinationTokenSymbols.has(symbol),
			);

			if (commonSymbols.length === 0) {
				throw new Error(
					`No common tokens found between chains ${fromChainSymbol} and ${toChainSymbol}`,
				);
			}

			const intermediateTokenSymbol = commonSymbols[0];

			const intermediateSourceToken = ensure(
				sourceChain.tokens.find(
					(t) => t.symbol === intermediateTokenSymbol,
				),
			);
			const intermediateDestinationToken = ensure(
				destinationChain.tokens.find(
					(t) => t.symbol === intermediateTokenSymbol,
				),
			);

			// Use LiFi to swap to the intermediate token on the source chain
			const lifiInput: InputType = {
				...input,
				inputAmount: {
					[`${req.fromChainId}:${req.fromTokenAddress}`]: BigInt(
						req.fromAmount,
					),
				},
				inputTokens: [
					{
						address: req.fromTokenAddress,
						value: `${req.fromChainId}:${req.fromTokenAddress}`,
					},
				],
				distribution: [100],
				outputTokens: [
					{
						address: intermediateSourceToken.tokenAddress,
						value: `${req.fromChainId}:${intermediateSourceToken.tokenAddress}`,
					},
				],
				outputChain: req.fromChainId,
				toAddress: tempAccount,
			};

			const { routes } = await handleLiFiRoutes(lifiInput, tempAccount);

			const swapRoute = routes[req.fromTokenAddress][0];
			if (!swapRoute) {
				throw new Error(
					`No swap route found from ${req.fromTokenAddress} to ${intermediateSourceToken.tokenAddress}`,
				);
			}

			previousRoutes.push(swapRoute);

			// Update sourceToken to the intermediate token
			sourceToken = intermediateSourceToken;
			destinationToken = intermediateDestinationToken;
			req.fromTokenAddress =
				sourceToken?.tokenAddress ?? req.fromTokenAddress;
		}

		if (previousRoutes.length === 0) {
			// @ts-expect-error - Partial route
			previousRoutes.push({
				steps: [],
				tags: ["RECOMMENDED"],
			});
		}

		const _routes = previousRoutes.map(async (prevRoute) => {
			const steps = [...prevRoute.steps];

			const finalStep = await FinalAllbridgeStepBuilder({
				fromChainId:
					steps[steps.length - 1]?.action.toChainId ??
					req.fromChainId,
				fromTokenAddress:
					steps[steps.length - 1]?.action.toToken.address ??
					sourceToken?.tokenAddress,
				fromAmount:
					steps[steps.length - 1]?.estimate?.toAmount ??
					req.fromAmount,
				fromAddress:
					steps[steps.length - 1]?.action.toAddress ?? tempAccount,
				toAddress: req.toAddress,
				target: req.toTokenAddress,
			}, {
				sourceToken,
				destinationToken,
				sourceChain,
				destinationChain,
				sdk,
			});

			steps.push(finalStep);

			const route: Route = {
				id: nanoid(),
				steps,
				fromAmount: steps[0].action.fromAmount,
				fromChainId: steps[0].action.fromChainId,
				fromAmountUSD: "", // Compute if needed
				fromToken: steps[0].action.fromToken,
				toAmount: steps[steps.length - 1].estimate?.toAmount ?? "0",
				toAmountMin: steps[steps.length - 1].estimate?.toAmount ?? "0",
				toAmountUSD: "", // Compute if needed
				toChainId: steps[steps.length - 1].action.toChainId,
				toToken: steps[steps.length - 1].action.toToken,
				containsSwitchChain: true,
				fromAddress: steps[0].action.fromAddress,
				tags: prevRoute.tags,
				toAddress: steps[steps.length - 1].action.toAddress,
				gasCostUSD: "", // Compute if needed
			};

			return route;
		});

		rawRoutes.push({
			routes: await Promise.all(_routes),
			unavailableRoutes: { filteredOut: [] },
		});
	}

	const routes: {
		[key: string]: Route[];
	} = {};

	for (const rawRoute of rawRoutes) {
		const _routes = rawRoute.routes;
		const index = rawRoutes.indexOf(rawRoute);
		if (
			!_routes ||
			typeof _routes[0] === "undefined" ||
			typeof _routes[0].fromAddress === "undefined"
		) {
			throw new Error(
				`No route found for ${input.inputTokens[mode === "single" ? 0 : index].value} -> ${input.outputTokens[mode === "single" ? 0 : index].value}`,
			);
		}

		const key =
			mode === "single"
				? _routes[0].fromToken.address
				: _routes[0].toToken.address;
		routes[key] = _routes;
	}

	return { routes };
}
