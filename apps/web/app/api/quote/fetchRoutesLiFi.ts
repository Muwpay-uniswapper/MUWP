import { advancedAPI } from "@/lib/core/data/api";
import type { InputType } from "./route";
import type { Route } from "@muwp/lifi-client";
import { zeroAddress } from "viem";

export async function handleLiFiRoutes(input: InputType, tempAccount: string) {
	const mode = input.outputTokens.length > 1 ? "split" : "single";

	const queries = (
		mode === "single" ? input.inputTokens : input.outputTokens
	).map(async (token) => {
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

		const routes = await advancedAPI.advancedRoutesPost(req);
		console.log(
			`Fetched ${routes.routes.length} routes for ${token.value} -> ${input.outputTokens[0].value}`,
		);
		// Filter routes that (1) contains more than 1 chain change, (2) contains more than 1 step after the first chain change
		routes.routes = routes.routes.filter((route) => {
			const chainChanges = route.steps.filter(
				(step) => step.action.fromChainId !== step.action.toChainId,
			);
			if (chainChanges.length === 0) {
				return true;
			}

			if (chainChanges.length > 1) {
				return false;
			}

			const stepsAfterChainChange = route.steps.slice(
				chainChanges[0] ? route.steps.indexOf(chainChanges[0]) : 0,
			);

			// Check if after changing the chain, the token is the native (gas) token on that chain
			const isGasTokenSwap =
				stepsAfterChainChange.length === 2 &&
				stepsAfterChainChange[0].action.toToken.address === zeroAddress;

			if (!isGasTokenSwap && stepsAfterChainChange.length > 1) {
				return false;
			}
			return true;
		});

		return routes;
	});

	console.log(`Fetching ${queries.length} routes`);

	const rawRoutes = await Promise.all(queries); // Fetch all routes in parallel

	console.log("Routes fetched successfully");

	const routes: {
		[key: string]: Route[];
	} = {};

	for (let index = 0; index < rawRoutes.length; index++) {
		const rawRoute = rawRoutes[index];
		const _routes = rawRoute.routes;
		if (
			!_routes ||
			typeof rawRoute.routes[0] === "undefined" ||
			typeof rawRoute.routes[0].fromAddress === "undefined"
		) {
			console.log(
				JSON.stringify(
					rawRoute.unavailableRoutes?.filteredOut,
					null,
					2,
				),
			);
			throw new Error(
				`No route found for ${input.inputTokens[mode === "single" ? index : 0].value} -> ${input.outputTokens[mode === "single" ? 0 : index].value}`,
			);
		}
		const key =
			mode === "single"
				? rawRoute.routes[0].fromToken.address
				: rawRoute.routes[0].toToken.address;
		routes[key] = _routes;
	}

	return { routes };
}
