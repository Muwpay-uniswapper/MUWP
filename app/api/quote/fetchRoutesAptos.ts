import { InputType } from "./route";
import { Route } from "@/lib/li.fi-ts";
import { AvailablePairs } from "@/lib/layerzero/aptos/omnichains";
import { formatUnits, parseUnits } from "viem";
import { nanoid } from "nanoid";
import { FinalAptosStepBuilder } from "@/lib/layerzero/aptos/stepBuilder";
import { handleLiFiRoutes } from "./fetchRoutesLiFi";

export async function handleAptosRoutes(input: InputType, tempAccount: string) {
    const mode = input.outputTokens.length > 1 ? "split" : "single";

    const queries = (mode == "single" ? input.inputTokens : input.outputTokens)
        .map(token => {
            const req = {
                fromAmount: mode == "single" ? input.inputAmount[token.value]?.toString() : (
                    input.inputAmount[input.inputTokens[0].value] * BigInt(input.distribution[input.outputTokens.findIndex(t => t.address == token.address && t.value == token.value)]) / 100n
                ).toString(),
                fromChainId: input.inputChain,
                fromTokenAddress: mode == "single" ? token.address : input.inputTokens[0].address,
                toChainId: input.outputChain,
                toTokenAddress: mode == "single" ? input.outputTokens[0].address : token.address,
                fromAddress: tempAccount,
                toAddress: input.toAddress ?? input.fromAddress,
                options: input.options,
            }

            return req;
        });

    const rawRoutes = [];
    for (const req of queries) {

        const previousRoutes: Route[] = [];

        const possibilities = AvailablePairs[req.fromChainId];
        if (!possibilities) throw new Error(`No routes available for ${req.fromChainId}`);
        let target = possibilities?.[req.fromTokenAddress.toLowerCase()];

        if (!target || target != req.toTokenAddress) {
            const outputToken = Object.entries(AvailablePairs[req.fromChainId]!).find(([_, value]) => value == req.toTokenAddress);
            if (!outputToken) throw new Error(`No route found for ${req.fromTokenAddress} -> ${req.toTokenAddress}`);
            const outputTokenAddress = outputToken[0];

            const lifiInput: InputType = {
                ...input,
                inputAmount: {
                    [`${req.fromChainId}:${req.fromTokenAddress}`]: BigInt(req.fromAmount)
                },
                inputTokens: [{
                    address: req.fromTokenAddress,
                    value: `${req.fromChainId}:${req.fromTokenAddress}`
                }],
                distribution: [100],
                outputTokens: [{
                    address: outputTokenAddress,
                    value: `${req.fromChainId}:${outputTokenAddress}`
                }],
                outputChain: req.fromChainId,
                toAddress: input.fromAddress, // We want to send the funds back to the managed wallet
            }

            const { routes } = await handleLiFiRoutes(lifiInput, tempAccount);

            previousRoutes.push(...routes[req.fromTokenAddress]);

            target = possibilities?.[outputTokenAddress];
        }

        console.log(`Target: ${target}`)
        console.log(`Looking at ${previousRoutes.length} previous routes`)

        if (previousRoutes.length == 0) {
            // @ts-expect-error - Partial route
            previousRoutes.push({
                steps: [],
                tags: ["RECOMMENDED"]
            });
        }
        const _routes = previousRoutes.map(async prevRoute => {
            const steps = [...prevRoute.steps];

            const finalStep = await FinalAptosStepBuilder({
                target: target as `0x${string}`,
                fromChainId: steps[steps.length - 1]?.action.toChainId ?? req.fromChainId,
                fromTokenAddress: steps[steps.length - 1]?.action.toToken.address ?? req.fromTokenAddress,
                fromAmount: steps[steps.length - 1]?.estimate?.toAmount ?? req.fromAmount,
                fromAddress: steps[steps.length - 1]?.action.toAddress ?? req.fromAddress,
                toAddress: req.toAddress as `0x${string}`
            })

            steps.push(finalStep);

            const route: Route = {
                id: nanoid(),
                steps,
                fromAmount: steps[0].action.fromAmount,
                fromChainId: steps[0].action.fromChainId,
                fromAmountUSD: formatUnits(parseUnits(steps[0].action.fromToken.priceUSD ?? "0", steps[0].action.fromToken.decimals) * BigInt(steps[0].action.fromAmount), steps[0].action.fromToken.decimals * 2),
                fromToken: steps[0].action.fromToken,
                toAmount: steps[steps.length - 1].estimate?.toAmount ?? "0",
                toAmountMin: steps[steps.length - 1].estimate?.toAmountMin ?? "0",
                toAmountUSD: formatUnits(parseUnits(steps[steps.length - 1].action.toToken.priceUSD ?? "0", steps[steps.length - 1].action.toToken.decimals) * BigInt(steps[steps.length - 1].estimate?.toAmount ?? "0"), steps[steps.length - 1].action.toToken.decimals * 2),
                toChainId: steps[steps.length - 1].action.toChainId,
                toToken: steps[steps.length - 1].action.toToken,
                containsSwitchChain: true,
                fromAddress: steps[0].action.fromAddress,
                tags: prevRoute.tags,
                toAddress: steps[steps.length - 1].action.toAddress,
                gasCostUSD: steps.map(step => step.estimate?.gasCosts?.map(gas => Number(gas.amountUSD ?? "0")).reduce((a, b) => a + b, 0) ?? 0).reduce((a, b) => a + b, 0).toString(),
            }

            return route;
        });

        rawRoutes.push({
            routes: await Promise.all(_routes),
            unavailableRoutes: { filteredOut: [] }
        });
    }

    console.log(`Fetching ${queries.length} routes`)

    console.log(`${rawRoutes.length} Routes fetched successfully`);

    // console.log(JSON.stringify(rawRoutes, null, 2));

    const routes: {
        [key: string]: Route[]
    } = {};

    for (const rawRoute of rawRoutes) {
        const _routes = rawRoute.routes;
        const index = rawRoutes.indexOf(rawRoute);
        if (!_routes || typeof rawRoute.routes[0] == "undefined" || typeof rawRoute.routes[0].fromAddress == "undefined") {
            console.log(JSON.stringify(rawRoute.unavailableRoutes?.filteredOut, null, 2));
            throw new Error(`No route found for ${input.inputTokens[mode == "single" ? 0 : index].value} -> ${input.outputTokens[mode == "single" ? 0 : index].value}`);
        }

        const key = mode == "single" ? _routes[0].fromToken.address : _routes[0].toToken.address;
        routes[key] = _routes;
    }

    return { routes };
}
