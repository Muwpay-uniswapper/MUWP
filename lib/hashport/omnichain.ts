import { HashportChainId } from "../layerzero/aptos/omnichains";
import { TokensGet200Response } from "../li.fi-ts";

export async function getTokensHashportBridge(): Promise<TokensGet200Response> {
    return {
        tokens: [
            {
                name: "USD Coin",
                symbol: "USDC[hts]",
                coinKey: "usdc:hedera:hashport",
                logoURI:
                    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aptos/assets/0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa%3A%3Aasset%3A%3AUSDC/logo.png",
                address: "0.0.1055459",
                decimals: 6,
                priceUSD: "1",
                chainId: HashportChainId,
            },
            {
                name: "HBAR",
                symbol: "HBAR",
                coinKey: "hbar:hedera:hashport",
                logoURI:
                    "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/hedera/info/logo.png",
                address: "HBAR",
                decimals: 8,
                priceUSD: "0.3",
                chainId: HashportChainId,
            }
        ],
    };
}
