import api from "@/lib/core/data/api";
import type { TokensGet200Response } from "@/lib/li.fi-ts";
import { zeroAddress } from "viem";

export const AptosChains = {
	arbitrum: 42161,
	avalanche: 43114,
	bsc: 56,
	ethereum: 1,
	optimism: 10,
	polygon: 137,
	goerli: 5,
};

export const RequiredBlockConfirmationAptos = {
	[AptosChains.ethereum]: 15,
	[AptosChains.avalanche]: 12,
	[AptosChains.bsc]: 20,
	[AptosChains.polygon]: 512,
	[AptosChains.arbitrum]: 20,
	[AptosChains.optimism]: 20,
	[AptosChains.goerli]: 15,
};
export const OmnichainAptosBridge = {
	[AptosChains.arbitrum]: "0x1bacc2205312534375c8d1801c27d28370656cff",
	[AptosChains.avalanche]: "0xa5972eee0c9b5bbb89a5b16d1d65f94c9ef25166",
	[AptosChains.bsc]: "0x2762409baa1804d94d8c0bcff8400b78bf915d5b",
	[AptosChains.ethereum]: "0x50002cdfe7ccb0c41f519c6eb0653158d11cd907",
	[AptosChains.optimism]: "0x86bb63148d17d445ed5398ef26aa05bf76dd5b59",
	[AptosChains.polygon]: "0x488863d609f3a673875a914fbee7508a1de45ec6",
	[AptosChains.goerli]: "0x7Cff4181f857B06114643D495648A95b3E0B0B81",
};

export const AptosChainId = 12360001;
export const StellarChainId = 1337;

export const AptosTokensAddress = {
	usdc: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDC",
	usdt: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::USDT",
	weth: "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa::asset::WETH",
	usdc_test:
		"0xec84c05cc40950c86d8a8bed19552f1e8ebb783196bb021c916161d22dc179f7::asset::USDC",
};

export const AvailablePairs: {
	[chain: number]:
		| {
				[token: string]: string | undefined;
		  }
		| undefined;
} = {
	[AptosChains.arbitrum]: {
		[zeroAddress]: AptosTokensAddress.weth,
		"0xff970a61a04b1ca14834a43f5de4533ebddb5cc8": AptosTokensAddress.usdc,
		"0x82af49447d8a07e3bd95bd0d56f35241523fbab1": AptosTokensAddress.weth,
	},
	[AptosChains.avalanche]: {
		"0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7": AptosTokensAddress.usdt,
		"0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e": AptosTokensAddress.usdc,
	},
	[AptosChains.bsc]: {
		"0x55d398326f99059ff775485246999027b3197955": AptosTokensAddress.usdt,
		"0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d": AptosTokensAddress.usdc,
	},
	[AptosChains.ethereum]: {
		[zeroAddress]: AptosTokensAddress.weth,
		"0xdac17f958d2ee523a2206206994597c13d831ec7": AptosTokensAddress.usdt,
		"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": AptosTokensAddress.usdc,
		"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": AptosTokensAddress.weth,
	},
	[AptosChains.optimism]: {
		[zeroAddress]: AptosTokensAddress.weth,
		"0x7f5c764cbc14f9669b88837ca1490cca17c31607": AptosTokensAddress.usdc,
		"0x4200000000000000000000000000000000000006": AptosTokensAddress.weth,
	},
	[AptosChains.polygon]: {
		"0xc2132d05d31c914a87c6611c10748aeb04b58e8f": AptosTokensAddress.usdt,
		"0x2791bca1f2de4661ed88a30c99a7a9449aa84174": AptosTokensAddress.usdc,
	},
	[AptosChains.goerli]: {
		[zeroAddress]: AptosTokensAddress.weth,
		"0x30c212b53714daf3739ff607aaa8a0a18956f13c":
			AptosTokensAddress.usdc_test,
	},
};

export async function getTokensAptosBridge(): Promise<TokensGet200Response> {
	return {
		tokens: [
			{
				name: "USD Coin (LayerZero)",
				symbol: "zUSDC",
				coinKey: "usdc:aptos:layerzero",
				logoURI:
					"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aptos/assets/0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa%3A%3Aasset%3A%3AUSDC/logo.png",
				address: AptosTokensAddress.usdc,
				decimals: 6,
				priceUSD: "1",
				chainId: AptosChainId,
			},
			{
				name: "USDT (LayerZero)",
				symbol: "zUSDT",
				coinKey: "usdt:aptos:layerzero",
				logoURI:
					"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aptos/assets/0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa%3A%3Aasset%3A%3AUSDT/logo.png",
				address: AptosTokensAddress.usdt,
				decimals: 6,
				priceUSD: "1",
				chainId: AptosChainId,
			},
			{
				name: "Wrapped Ether (LayerZero)",
				symbol: "zWETH",
				coinKey: "weth:aptos:layerzero",
				logoURI:
					"https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aptos/assets/0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa%3A%3Aasset%3A%3AWETH/logo.png",
				address: AptosTokensAddress.weth,
				decimals: 6,
				priceUSD: await api
					.tokenGet("1", "WETH")
					.then((res) => res.priceUSD)
					.catch(() => undefined),
				chainId: AptosChainId,
			},
			// {
			//     name: "USDC (LayerZero testnet)",
			//     symbol: "zgUSDC",
			//     coinKey: "zgusdc:aptos:layerzero",
			//     logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aptos/assets/0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa%3A%3Aasset%3A%3AUSDC/logo.png",
			//     address: AptosTokensAddress.usdc_test,
			//     decimals: 6,
			//     priceUSD: "1",
			//     chainId: AptosChainId
			// }
		],
	};
}
