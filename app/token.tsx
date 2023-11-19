"use server";
import * as React from "react"
import { TokenCombobox } from "../components/token_combobox";

export async function TokenSelector({
    id
}: {
    id?: string
}) {
    const tokens = await fetch("https://backend.muwp.xyz/api/v1/lifi/tokens?isTestnet=false&chainId=1")
    const tokensJson = await tokens.json()
    const tokenList = tokensJson.tokens.map((token) => {
        return {
            value: `${token.coinKey}:${token.address}`,
            label: token.name,
            logoURI: token.logoURI,
            priceUSD: token.priceUSD
        }
    })

    return <TokenCombobox id={id} tokenList={tokenList} />
}