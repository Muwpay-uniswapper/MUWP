import { create, StoreApi } from 'zustand';
import { Token } from '@/lib/front/model/CellLike';
import { parseUnits } from "viem";
import { AllowDenyPrefer } from '@/lib/li.fi-ts';

type SwapStore = {
    allowDenyBridges: AllowDenyPrefer;
    toggleAllowDenyBridge: (bridge: string) => void;
    allowDenyExchanges: AllowDenyPrefer;
    toggleAllowDenyExchange: (exchange: string) => void;
    setAllowDenyExchanges: (allowDenyExchanges: AllowDenyPrefer) => void;
    inputTokens: Token[];
    outputToken: Token | null;
    outputChain: number | null;
    inputAmount: { [key: string]: bigint };
    setInputToken: (token: Token, index?: number) => void;
    removeInputToken: (index?: number) => void;
    setOutputToken: (token: Token | null) => void;
    setOutputChain: (chain: number | null) => void;
    setAmount: (token: Token, amount: bigint) => void;
    priceOutput: () => { amount: bigint, priceUSD: bigint };
};

export const useSwapStore = create<SwapStore>((set: StoreApi<SwapStore>['setState'], get: StoreApi<SwapStore>['getState']) => ({
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
    outputToken: null,
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
    setOutputToken: (token: Token | null) => set({ outputToken: token }),
    setOutputChain: (chain: number | null) => set({ outputChain: chain }),
    setAmount: (token: Token, amount: bigint) => set((state: SwapStore) => {
        const inputAmount = { ...state.inputAmount };
        inputAmount[token.value] = amount;
        return { inputAmount };
    }),
    priceOutput: () => {
        const { inputTokens, inputAmount, outputToken } = get();
        if (!outputToken) {
            return { amount: 0n, priceUSD: 0n };
        }
        const priceUSD = inputTokens.reduce((total, token) => {
            const amount = parseUnits(token.priceUSD?.toString() ?? "", 9) * (inputAmount[token.value] ?? 0n);
            return total + amount / (10n ** BigInt(token.decimals)); // We keep to 9 decimals
        }, 0n);
        // Convert USD to output token
        const amount = priceUSD * (10n ** BigInt(outputToken.decimals)) / parseUnits(outputToken.priceUSD?.toString() ?? "", 9);
        return { amount, priceUSD }
    }
}));