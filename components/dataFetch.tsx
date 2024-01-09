"use server";
import * as React from "react"
import { TokenCombobox, TokenComboboxes } from "@/components/tokens/token_combobox";
import { Chain, Token } from "@/lib/front/model/CellLike";
import { ChainCombobox } from "@/components/chains/chain-selector";
import api from "@/lib/front/data/api"
import { unstable_noStore } from "next/cache";
import { TokensGet200Response } from "@/lib/li.fi-ts";

export async function TokenSelector({
    id,
    chain,
    mode
}: {
    id?: string,
    chain?: number,
    mode: "input" | "output"
}) {
    // unstable_noStore()
    if (typeof chain === "undefined") {
        chain = 1
    }
    let tokens: TokensGet200Response
    try {
        tokens = await api.tokensGet(chain.toString())
    } catch (e) {
        console.log(e)
        tokens = new TokensGet200Response()
    }

    const tokenList: Token[] = tokens.tokens?.map((token) => {
        return {
            value: `${token.symbol}:${token.name}:${token.address}`,
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
    // unstable_noStore()
    const chains = await api.chainsGet()

    const chainList: Chain[] = chains.chains?.filter((chain) => {
        // const muwpChain = muwpChains.find((muwpChain) => muwpChain.id == chain.id)
        // return muwpChain?.muwpContract != "0x" && muwpChain != undefined
        return true
    })
        .map((chain) => {
            return {
                value: `${chain.key}:${chain.id}`,
                label: chain.name,
                logoURI: chain.logoURI,
                chainId: chain.id
            }
        }) ?? []

    return <ChainCombobox chainList={chainList} mode={mode} />
}