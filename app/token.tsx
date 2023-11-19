"use server";
import * as React from "react"
import { TokenComboboxes } from "../components/token_combobox";
import { Token } from "@/lib/front/model/Token";

export async function TokenSelector({
    id,
    chain
}: {
    id?: string,
    chain?: number
}) {
    if (typeof chain === "undefined") {
        chain = 1
    }
    const tokens = await fetch(`https://backend.muwp.xyz/api/v1/lifi/tokens?isTestnet=false&chainId=${chain ?? 1}`)
    const tokensJson = await tokens.json()
    const tokenList: Token[] = tokensJson.tokens.map((token) => {
        return {
            value: `${token.coinKey}:${token.address}`,
            label: token.name,
            logoURI: token.logoURI,
            priceUSD: token.priceUSD,
            address: token.address,
            ticker: token.symbol,
            decimals: token.decimals
        }
    })

    return <TokenComboboxes tokenList={tokenList} />
}