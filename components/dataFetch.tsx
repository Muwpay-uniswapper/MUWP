"use server";
import * as React from "react"
import { TokenComboboxes } from "@/components/tokens/token_combobox";
import { Chain, Token } from "@/lib/core/model/CellLike";
import { ChainCombobox } from "@/components/chains/chain-selector";
import api from "@/lib/core/data/api"
import { TokensGet200Response } from "@/lib/li.fi-ts";
import { muwpChains } from "@/muwp";
import { TokenList } from '@uniswap/token-lists'

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

    const safeTokens = await fetch("https://gateway.ipfs.io/ipns/tokens.uniswap.org").then((res) => res.json()) as TokenList

    const tokenList: Token[] = tokens.tokens?.map((token) => {
        return {
            value: `${token.symbol}:${token.name}:${token.address}`,
            label: token.name,
            logoURI: token.logoURI,
            priceUSD: token.priceUSD,
            address: token.address,
            ticker: token.symbol,
            decimals: token.decimals,
            chainId: chain!,
            verified: safeTokens.tokens.find((safeToken) => safeToken.address == token.address && safeToken.chainId == token.chainId) != undefined
        }
    }) ?? []

    return <TokenComboboxes tokenList={tokenList} mode={mode} />
}

export async function ChainSelector({
    mode
}: {
    mode: "input" | "output"
}) {
    // unstable_noStore()
    const chains = await api.chainsGet("EVM,SVM") // Backend not ready for SVM (address issues)

    const chainList: Chain[] = chains.chains?.filter((chain) => {
        if (mode == "input") {
            if (chain.chainType != "EVM") return false
            const muwpChain = muwpChains.find((muwpChain) => muwpChain.id == chain.id)
            return muwpChain?.muwpContract != "0x" && muwpChain != undefined
        }
        return true
    })
        .map((chain) => {
            return {
                value: `${chain.key}:${chain.id}`,
                label: chain.name,
                logoURI: chain.logoURI,
                chainId: chain.id,
                type: chain.chainType as "EVM" | "SVM"
            }
        }) ?? []

    if (mode == "output") {
        chainList.push({
            value: "aptos:551", // 551 is the sum of the ASCII values of "aptos"... it's to avoid conflicts with other chains
            label: "Aptos",
            logoURI: "https://aptosfoundation.org/brandbook/logomark/SVG/Aptos_mark_WHT.svg",
            chainId: 551,
            type: "Aptos"
        })
    }

    return <ChainCombobox chainList={chainList} mode={mode} />
}