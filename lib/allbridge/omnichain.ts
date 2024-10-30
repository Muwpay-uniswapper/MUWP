import { StellarChainId } from "../layerzero/aptos/omnichains";
import { TokensGet200Response } from "../li.fi-ts";

export async function getTokensAllBridge(): Promise<TokensGet200Response> {
    return {
        tokens: [
            {
                name: "USD Coin",
                symbol: "USDC",
                coinKey: "usdc:stellar:allbridge",
                logoURI:
                    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aptos/assets/0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa%3A%3Aasset%3A%3AUSDC/logo.png",
                address: "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
                decimals: 6,
                priceUSD: "1",
                chainId: StellarChainId,
            },
        ],
    };
}
