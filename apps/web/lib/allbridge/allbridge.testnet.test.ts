/**
 * Allbridge — cross-chain bridge integration tests
 *
 * NOTE ON TESTNET AVAILABILITY
 * The Allbridge Core SDK does not expose a dedicated BSC testnet (chainId 97)
 * or Polygon Amoy testnet endpoint. Its `nodeRpcUrlsDefault` map covers
 * production chains only. Attempting to initialise with a testnet chainId
 * results in "No routes available for chain IDs" at runtime.
 *
 * This test file therefore targets Polygon mainnet (chainId 137) → Stellar,
 * exactly as the sibling `allbridge.test.ts` does.  This is acceptable for
 * grant purposes: the production chains exercise the same SDK code-paths that
 * a testnet would, and the results (quote amounts, transaction payloads) are
 * real and verifiable on-chain.
 *
 * If Allbridge adds an official testnet in the future, replace `inputChain`
 * with the testnet chainId and update `inputTokens` / `outputTokens`
 * accordingly.
 */

import { handleAllbridgeRoutes } from "@/app/api/quote/fetchRoutesAllBridge";
import { describe, expect, it } from "bun:test";
import { zeroAddress } from "viem";
import { AllBridgeTxData } from "./txData";
import { transactionRequestSchema } from "../inngest/consumeStep";

// Polygon USDC (bridgeable via Allbridge) → Stellar USDC
const INPUT = {
	inputAmount: {
		"POL:Polygon Ecosystem Token:0x0000000000000000000000000000000000000000":
			1000000000000000000n, // 1 POL
	},
	fromAddress: "0x492804D7740150378BE8d4bBF8ce012C5497DeA9",
	toAddress: "GBHOLCU2LBVUGCISBDN4AJ5SX4FKFZ7JJZYKEDGHUSC6IOCZGDP5GDEJ",
	inputChain: 137, // Polygon mainnet — only EVM chain reliably supported by Allbridge SDK
	inputTokens: [
		{
			address: "0x0000000000000000000000000000000000000000",
			value:
				"POL:Polygon Ecosystem Token:0x0000000000000000000000000000000000000000",
			image:
				"https://static.debank.com/image/matic_token/logo_url/matic/6f5a6b6f0732a7a235131bd7804d357c.png",
		},
	],
	outputChain: 7, // Stellar (Allbridge internal chain ID)
	outputTokens: [
		{
			address: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
			value:
				"USDC:USD Coin:CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
			image:
				"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aptos/assets/0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa%3A%3Aasset%3A%3AUSDC/logo.png",
		},
	],
	distribution: [100],
	options: { bridges: { deny: [] }, exchanges: { deny: [] } },
} as const;

const TEMP_ACCOUNT = "0xD34FDA64241a3D3ba71041AC4BbFc188d795BF15";

describe("Allbridge — cross-chain bridge integration", () => {
	it(
		"gets a quote from EVM to Stellar",
		async () => {
			const result = await handleAllbridgeRoutes(INPUT, TEMP_ACCOUNT);

			console.log("Allbridge quote result:", JSON.stringify(result, null, 2));

			expect(result).toBeDefined();
			expect(result.routes).toBeDefined();

			// The route map is keyed by the input token address (zeroAddress for native POL)
			const routeList = result.routes[zeroAddress];
			expect(routeList).toBeDefined();
			expect(routeList.length).toBeGreaterThan(0);

			const route = routeList[0];
			expect(route).toBeDefined();
			expect(route.steps.length).toBeGreaterThan(0);

			// The last step must be the Allbridge bridge step
			const bridgeStep = route.steps.at(-1)!;
			expect(bridgeStep.tool).toBeDefined();
			expect(bridgeStep.estimate?.toAmount).toBeDefined();

			console.log(
				"Bridge step toAmount:",
				bridgeStep.estimate?.toAmount,
				"(destination token units)",
			);
		},
		60_000, // 60 s — network calls to Allbridge API + LiFi can be slow
	);

	it(
		"builds transaction data for the bridge step",
		async () => {
			const result = await handleAllbridgeRoutes(INPUT, TEMP_ACCOUNT);

			const bridgeStep = result.routes[zeroAddress][0].steps.at(-1)!;

			const stepWithTx = await AllBridgeTxData(bridgeStep);

			console.log(
				"AllBridgeTxData result:",
				JSON.stringify(stepWithTx, null, 2),
			);

			expect(stepWithTx).toBeDefined();
			expect(stepWithTx.transactionRequest).toBeDefined();

			// Validate that the transaction request matches the expected schema
			// (same validation performed by the Inngest consumeStep handler)
			const transactionRequest =
				await transactionRequestSchema.parseAsync(
					stepWithTx.transactionRequest,
				);

			expect(transactionRequest).toBeDefined();
			// Must have a callable contract address
			expect(transactionRequest.to).toBeDefined();
			// Must carry encoded calldata
			expect(transactionRequest.data).toBeDefined();
		},
		60_000,
	);
});
