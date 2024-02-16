"use client";

import { CellLike, Token, Chain } from "@/lib/core/model/CellLike"
import { useSwapStore } from "../swapStore"
import { useAccount, useChains, useSwitchChain } from "wagmi"

export class ComboboxDelegate<Value extends CellLike> {
    get keyword() {
        return "NULL"
    }

    get autoExtend() {
        return false
    }

    valueAt(index: number): Value | undefined {
        return undefined
    }

    setValueAt(index: number, value: Value) {
        // DO NOTHING
    }

    search(search: string, value: Value): Value[] {
        return []
    }
}

export class TokenComboboxDelegate extends ComboboxDelegate<Token> {
    get keyword() {
        return "token"
    }

    get autoExtend() {
        return true
    }

    valueAt(index: number): Token | undefined {
        const { inputTokens } = useSwapStore()

        return inputTokens[index]
    }

    setValueAt(index: number, value: Token) {
        const { setInputToken } = useSwapStore()

        setInputToken(value, index)
    }

    search(search: string, value: Token): Token[] {
        const { inputTokens } = useSwapStore()

        return inputTokens
            .filter((cell) => cell.label.toLowerCase().includes(search.toLowerCase()) && !(inputTokens.includes(cell) && cell !== value))
    }
}

export class ChainComboboxDelegate extends ComboboxDelegate<Chain> {
    get keyword() {
        return "chain"
    }

    get autoExtend() {
        return true
    }

    valueAt(index: number): Chain | undefined {
        const { chain } = useAccount();

        return {
            label: chain?.name ?? index.toString(),
            logoURI: "",
            value: `${chain?.name}-${chain?.id}`,
            chainId: chain?.id ?? 1,
            type: "EVM"
        }
    }

    setValueAt(index: number, value: Chain) {
        const { reset, switchChain } = useSwitchChain({
            mutation: {
                onSettled: () => {
                    reset(); // reset mutation variables (eg. pendingChainId, error)
                },
            }
        });

        switchChain({ chainId: value.chainId })
    }

    search(search: string, value: Chain): Chain[] {
        const chains = useChains();
        return chains
            .filter((cell) => cell.name.toLowerCase().includes(search.toLowerCase()) && cell.id !== value.chainId)
            .slice(0, 10)
            .map(partialChain => {
                return {
                    chainId: partialChain.id,
                    label: partialChain.name,
                    logoURI: "",
                    value: `${partialChain?.name}-${partialChain?.id}`,
                    type: "EVM"
                }
            })
    }
}