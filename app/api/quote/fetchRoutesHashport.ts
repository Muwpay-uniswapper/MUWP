import type { InputType } from "./route";
import type { Route } from "@/lib/li.fi-ts";


import { nanoid } from "nanoid";
// We'll create this
import { handleLiFiRoutes } from "./fetchRoutesLiFi";
import { formatUnits, parseUnits } from "viem";
import { HashportApiClient } from "@hashport/sdk";
import { FinalHashportStepBuilder } from "@/lib/hashport/stepBuilder";

// ensure is a function that returns a value or throws an error if the value is undefined or null
function ensure<T>(value: T | undefined, error?: string): T {
  if (value === undefined || value === null) {
    throw new Error(error ?? "Value is undefined");
  }
  return value;
}

export async function handleHashportRoutes(
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
                    t.address === token.address && t.value === token.value,
                )
                ],
              )) /
            100n
          ).toString(),
      fromChainId: input.inputChain,
      fromTokenAddress:
        mode === "single" ? token.address : input.inputTokens[0].address,
      fromTokenImage:
        mode === "single" ? token.image : input.inputTokens[0].image,
      toChainId: input.outputChain,
      toTokenAddress:
        mode === "single" ? input.outputTokens[0].address : token.address,
      toTokenImage:
        mode === "single" ? input.outputTokens[0].image : token.image,
      fromAddress: tempAccount,
      toAddress: input.toAddress ?? input.fromAddress,
      options: input.options,
    };

    return req;
  });

  const rawRoutes = [];

  // Initialize the Hashport SDK once
  const hashportApiClient = new HashportApiClient('mainnet');

  const chainDetailsMap = await hashportApiClient.networks();

  for (const req of queries) {
    const previousRoutes: Route[] = [];
    const tokens = Object.values(await hashportApiClient.networkAssets(req.fromChainId));
    let commonSymbols: string[];
    switch (req.toTokenAddress) {
      case "0.0.1302528":
        commonSymbols = ["busd"];
        break;
      case "0.0.1055459":
        commonSymbols = ["usdc"];
        break;
      default:
        commonSymbols = ["hbar"];
    }

    const intermediateTokenSymbol = commonSymbols[0];

    const intermediateSourceToken = ensure(
      tokens.find((t) => t.symbol.includes(intermediateTokenSymbol.toUpperCase())),
      `No intermediate token found for ${intermediateTokenSymbol}`,
    );

    let canBridgeDirectly = false;
    if (
      Object.values(chainDetailsMap).some(chain => chain.id === req.fromChainId) &&
      Object.values(chainDetailsMap).some(chain => chain.id === req.toChainId) &&
      // Check from token is either USDC or HBAR
      req.fromTokenAddress == intermediateSourceToken.id
    ) {
      canBridgeDirectly = true;
      console.log("Can bridge directly");
    }

    if (!canBridgeDirectly) {

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
            address: intermediateSourceToken.id,
            value: `${req.fromChainId}:${intermediateSourceToken.id}`,
          },
        ],
        outputChain: req.fromChainId,
        toAddress: tempAccount,
      };

      const { routes } = await handleLiFiRoutes(lifiInput, tempAccount);

      const swapRoute = routes[req.fromTokenAddress][0];
      if (!swapRoute) {
        throw new Error(
          `No swap route found from ${req.fromTokenAddress} to ${intermediateSourceToken.id}`,
        );
      }

      previousRoutes.push(swapRoute);

      // Update sourceToken to the intermediate token
      // sourceToken = intermediateSourceToken;
      // destinationToken = intermediateDestinationToken;
      req.fromTokenAddress = intermediateSourceToken.id;
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

      const finalStep = await FinalHashportStepBuilder(
        {
          fromChainId:
            steps[steps.length - 1]?.action.toChainId ?? req.fromChainId,
          fromTokenAddress:
            steps[steps.length - 1]?.action.toToken.address ?? req.fromTokenAddress,
          fromAmount:
            steps[steps.length - 1]?.estimate?.toAmount ?? req.fromAmount,
          fromAddress: steps[steps.length - 1]?.action.toAddress ?? tempAccount,
          toAddress: req.toAddress,
          toChainId: req.toChainId,
          target: req.toTokenAddress,
          fromTokenImage: req.fromTokenImage,
          toTokenImage: req.toTokenImage,
        }
      );

      steps.push(finalStep);

      const route: Route = {
        id: nanoid(),
        steps,
        fromAmount: steps[0].action.fromAmount,
        fromChainId: steps[0].action.fromChainId,
        fromAmountUSD: formatUnits(
          parseUnits(
            steps[0].action.fromToken.priceUSD ?? "0",
            steps[0].action.fromToken.decimals,
          ) * BigInt(steps[0].action.fromAmount),
          steps[0].action.fromToken.decimals * 2,
        ),
        fromToken: steps[0].action.fromToken,
        toAmount: steps[steps.length - 1].estimate?.toAmount ?? "0",
        toAmountMin: steps[steps.length - 1].estimate?.toAmount ?? "0",
        toAmountUSD: formatUnits(
          parseUnits(
            steps[steps.length - 1].action.toToken.priceUSD ?? "0",
            steps[steps.length - 1].action.toToken.decimals,
          ) * BigInt(steps[steps.length - 1].estimate?.toAmount ?? "0"),
          steps[steps.length - 1].action.toToken.decimals * 2,
        ), // Compute if needed
        toChainId: steps[steps.length - 1].action.toChainId,
        toToken: steps[steps.length - 1].action.toToken,
        containsSwitchChain: true,
        fromAddress: steps[0].action.fromAddress,
        tags: prevRoute.tags,
        toAddress: steps[steps.length - 1].action.toAddress,
        gasCostUSD: steps
          .map(
            (step) =>
              step.estimate?.gasCosts
                ?.map((gas) => Number(gas.amountUSD ?? "0"))
                .reduce((a, b) => a + b, 0) ?? 0,
          )
          .reduce((a, b) => a + b, 0)
          .toString(),
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
