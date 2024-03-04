import { AptosChainId, getTokensAptosBridge } from "@/lib/layerzero/aptos/omnichains"
import { Token, TokensGet200Response } from "@/lib/li.fi-ts"
import api from "./api"

export async function tokensGet(chain: number): Promise<TokensGet200Response> {
    let tokens: TokensGet200Response
    try {
        switch (chain) {
            case AptosChainId:
                tokens = await getTokensAptosBridge()
                break
            default:
                tokens = await api.tokensGet(chain.toString())
                if (chain == 5) { // Goerli
                    tokens.tokens?.push({
                        address: "0x30c212b53714daf3739Ff607AaA8A0A18956f13c",
                        chainId: 5,
                        decimals: 6,
                        name: "USD Coin (LayerZero)",
                        priceUSD: "1",
                        symbol: "zgUSDC",
                        coinKey: "zgusdc:aptos:layerzero",
                        logoURI: "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/aptos/assets/0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa%3A%3Aasset%3A%3AUSDC/logo.png"
                    })
                }
                break
        }
    } catch (e) {
        console.log(e)
        tokens = new TokensGet200Response()
    }

    return tokens
}

export async function tokenGet(chain: number, address: string): Promise<Token> {
    console.log(`tokenGet(${chain}, ${address})`)
    const tokens = await tokensGet(chain)
    const token = tokens.tokens?.find(token => token.address.toLowerCase() == address.toLowerCase())
    if (token) {
        console.log(`tokenGet(${chain}, ${address}) found token in tokensGet`)
        return token
    }

    return await api.tokenGet(chain.toString(), address)
}