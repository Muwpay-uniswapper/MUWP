"use server";
import * as React from "react"
import { TokenCombobox, TokenComboboxes } from "@/components/tokens/token_combobox";
import { Chain, Token } from "@/lib/front/model/CellLike";
import { ChainCombobox } from "@/components/chains/chain-selector";
import { ChainComboboxDelegate, TokenComboboxDelegate } from "@/lib/front/data/delegate/ComboboxDelegate";
import api from "@/lib/front/data/api"

export async function TokenSelector({
    id,
    chain,
    mode
}: {
    id?: string,
    chain?: number,
    mode: "input" | "output"
}) {
    if (typeof chain === "undefined") {
        chain = 1
    }

    const tokens = await api.tokensGet(chain.toString())

    const tokenList: Token[] = tokens.tokens?.map((token) => {
        return {
            value: `${token.coinKey}:${token.address}`,
            label: token.name,
            logoURI: token.logoURI,
            priceUSD: token.priceUSD,
            address: token.address,
            ticker: token.symbol,
            decimals: token.decimals,
            chainId: chain!
        }
    }) ?? []

    if (mode == "input") {
        return <TokenComboboxes tokenList={tokenList} />
    }
    return <TokenCombobox tokenList={tokenList} mode={mode} />
}

export async function ChainSelector({
    mode
}: {
    mode: "input" | "output"
}) {
    const chains = await api.chainsGet()

    const chainList: Chain[] = chains.chains?.map((chain) => {
        return {
            value: `${chain.key}:${chain.id}`,
            label: chain.name,
            logoURI: chain.logoURI,
            chainId: chain.id
        }
    }) ?? []

    return <ChainCombobox chainList={chainList} mode={mode} />
}