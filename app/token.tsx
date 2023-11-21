"use server";
import * as React from "react"
import { TokenCombobox, TokenComboboxes } from "@/components/tokens/token_combobox";
import { Chain, Token } from "@/lib/front/model/CellLike";
import { ChainCombobox, ChooseChain } from "@/components/chain-selector";
import { ChainComboboxDelegate, TokenComboboxDelegate } from "@/lib/front/data/delegate/ComboboxDelegate";

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

    const delegate = new TokenComboboxDelegate()

    if (mode == "input") {
        return <TokenComboboxes tokenList={tokenList} />
    }
    return <TokenCombobox tokenList={tokenList} mode={mode} />
}

export async function ChainSelector() {
    const chains = await fetch(`https://backend.muwp.xyz/api/v1/lifi/chains?isTestnet=false`)
    const chainsJson = await chains.json()
    /* Example of chainsJson.chains:
    {
      key: 'fus',
      chainType: 'EVM',
      name: 'FUSE',
      coin: 'FUSE',
      id: 122,
      mainnet: true,
      logoURI: 'https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/chains/fuse.svg',
      tokenlistUrl: 'https://raw.githubusercontent.com/sushiswap/default-token-list/master/tokens/fuse.json',
      multicallAddress: '0xcA11bde05977b3631167028862bE2a173976CA11',
      metamask: [Object],
      nativeToken: [Object]
    },
    */
    const chainList: Chain[] = chainsJson.chains.map((chain) => {
        return {
            value: `${chain.key}:${chain.id}`,
            label: chain.name,
            logoURI: chain.logoURI,
            chainId: chain.id
        }
    })

    return <ChainCombobox chainList={chainList} />
}