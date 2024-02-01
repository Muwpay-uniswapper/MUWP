import { create, StoreApi } from 'zustand';
import { Token } from '@/lib/core/model/CellLike';
import { parseUnits } from "viem";
import { AllowDenyPrefer } from '@/lib/li.fi-ts';

type SwapStore = {
    targetAddress?: string;
    setTargetAddress: (address: string | undefined) => void;
    allowDenyBridges: AllowDenyPrefer;
    toggleAllowDenyBridge: (bridge: string) => void;
    allowDenyExchanges: AllowDenyPrefer;
    toggleAllowDenyExchange: (exchange: string) => void;
    setAllowDenyExchanges: (allowDenyExchanges: AllowDenyPrefer) => void;
    inputTokens: Token[];
    outputTokens: Token[];
    outputDistribution: number[];
    outputChain: number | null;
    inputAmount: { [key: string]: bigint };
    setInputToken: (token: Token, index?: number) => void;
    removeInputToken: (index?: number) => void;
    setOutputToken: (token: Token, index?: number) => void;
    removeOutputToken: (index?: number) => void;
    setDistribution: (distribution: number[]) => void;
    setOutputChain: (chain: number | null) => void;
    setAmount: (token: Token, amount: bigint) => void;
    priceOutput: (token: Token) => { amount: bigint, priceUSD: bigint };
    clearSwaps: () => void;
};

export const useSwapStore = create<SwapStore>((set: StoreApi<SwapStore>['setState'], get: StoreApi<SwapStore>['getState']) => ({
    targetAddress: undefined,
    setTargetAddress: (address: string | undefined) => set({ targetAddress: address }),
    allowDenyBridges: { allow: undefined, deny: [], prefer: undefined },
    toggleAllowDenyBridge: (bridge: string) => {
        set((state: SwapStore) => {
            const allowDenyBridges = { ...state.allowDenyBridges };
            if (allowDenyBridges.deny?.includes(bridge)) {
                allowDenyBridges.deny = allowDenyBridges.deny.filter(b => b !== bridge);
            } else {
                allowDenyBridges.deny?.push(bridge);
            }
            return { allowDenyBridges };
        })
    },
    allowDenyExchanges: { allow: undefined, deny: [], prefer: undefined },
    toggleAllowDenyExchange: (exchange: string) => {
        set((state: SwapStore) => {
            const allowDenyExchanges = { ...state.allowDenyExchanges };
            if (allowDenyExchanges.deny?.includes(exchange)) {
                allowDenyExchanges.deny = allowDenyExchanges.deny.filter(b => b !== exchange);
            } else {
                allowDenyExchanges.deny?.push(exchange);
            }
            return { allowDenyExchanges };
        })
    },
    setAllowDenyExchanges: (allowDenyExchanges: AllowDenyPrefer) => set({ allowDenyExchanges }),
    inputTokens: [],
    outputTokens: [],
    outputDistribution: [],
    outputChain: null,
    inputAmount: {},

    setInputToken: (token: Token, index?: number) => set((state: SwapStore) => {
        const tokens = [...state.inputTokens];
        if (index === undefined) {
            tokens.push(token);
        } else {
            tokens[index] = token;
        }
        return { inputTokens: tokens };
    }),
    removeInputToken: (index?: number) => set((state: SwapStore) => {
        const tokens = [...state.inputTokens];
        const inputAmount = { ...state.inputAmount };
        // Remove the input amount for the removed token
        const token = tokens[index ?? 0];
        const v = token?.value;

        if (v && inputAmount[v]) {
            delete inputAmount[v];
        }

        tokens.splice(index ?? 0, 1);
        return { inputTokens: tokens, inputAmount };
    }),
    setOutputToken: (token: Token, index?: number) => set((state: SwapStore) => {
        const tokens = [...state.outputTokens];
        if (index === undefined) {
            tokens.push(token);
        } else {
            tokens[index] = token;
        }
        return { outputTokens: tokens };
    }),
    removeOutputToken: (index?: number) => set((state: SwapStore) => {
        const tokens = [...state.outputTokens];
        tokens.splice(index ?? 0, 1);
        return { outputTokens: tokens };
    }),
    setDistribution: (distribution: number[]) => set({ outputDistribution: distribution }),
    setOutputChain: (chain: number | null) => set({ outputChain: chain, outputTokens: [], targetAddress: undefined }),
    setAmount: (token: Token, amount: bigint) => set((state: SwapStore) => {
        const inputAmount = { ...state.inputAmount };
        inputAmount[token.value] = amount;
        return { inputAmount };
    }),
    priceOutput: (token: Token) => {
        const { inputTokens, inputAmount, outputTokens, outputDistribution } = get();
        if (outputTokens.length == 1) {
            const priceUSD = inputTokens.reduce((total, token) => {
                const amount = parseUnits(token.priceUSD?.toString() ?? "", 9) * (inputAmount[token.value] ?? 0n);
                return total + amount / (10n ** BigInt(token.decimals)); // We keep to 9 decimals
            }, 0n);
            // Convert USD to output token
            const amount = priceUSD * (10n ** BigInt(outputTokens[0].decimals)) / parseUnits(outputTokens[0].priceUSD?.toString() ?? "", 9);
            return { amount, priceUSD }
        } else if (outputTokens.length - 1 == outputDistribution.length) {
            const index = outputTokens.findIndex(t => t.address == token.address && t.chainId == token.chainId);
            if (index == -1) {
                return { amount: 0n, priceUSD: 0n };
            }
            const percentage = index == outputDistribution.length ? 100 - outputDistribution[index - 1] :
                index > 0 ? (outputDistribution[index] - outputDistribution[index - 1]) : outputDistribution[index];

            const inputPriceUSD = inputTokens.reduce((total, token) => {
                const amount = parseUnits(token.priceUSD?.toString() ?? "", 9) * (inputAmount[token.value] ?? 0n);
                return total + amount / (10n ** BigInt(token.decimals)); // We keep to 9 decimals
            }, 0n);

            try {
                const priceUSD = inputPriceUSD * BigInt(Math.round(percentage));
                // Convert USD to output token
                const amount = priceUSD * (10n ** BigInt(token.decimals)) / parseUnits(token.priceUSD?.toString() ?? "", 9);
                return { amount: amount / 100n, priceUSD: priceUSD / 100n }
            } catch (e) {
                console.log(e);
            }
        }
        return { amount: 0n, priceUSD: 0n };
    },
    clearSwaps: () => set({
        inputTokens: [],
        outputTokens: [],
        outputChain: null,
        inputAmount: {},
        targetAddress: undefined,
    })
}));