import { create, StoreApi } from 'zustand';
import { Token } from '@/lib/front/model/Token';

type SwapStore = {
    inputTokens: Token[];
    outputToken: Token | null;
    outputChain: number | null;
    setInputToken: (token: Token, index?: number) => void;
    setOutputToken: (token: Token) => void;
    setOutputChain: (chain: number) => void;
};

export const useSwapStore = create<SwapStore>((set: StoreApi<SwapStore>['setState']) => ({
    inputTokens: [],
    outputToken: null,
    outputChain: null,

    setInputToken: (token: Token, index?: number) => set((state: SwapStore) => {
        const tokens = [...state.inputTokens];
        if (index === undefined) {
            tokens.push(token);
        } else {
            tokens[index] = token;
        }
        return { inputTokens: tokens };
    }),
    setOutputToken: (token: Token) => set({ outputToken: token }),
    setOutputChain: (chain: number) => set({ outputChain: chain }),
}));