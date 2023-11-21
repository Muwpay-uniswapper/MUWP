import { create, StoreApi } from 'zustand';
import { Token } from '@/lib/front/model/CellLike';

type SwapStore = {
    inputTokens: Token[];
    outputToken: Token | null;
    outputChain: number | null;
    setInputToken: (token: Token, index?: number) => void;
    removeInputToken: (index?: number) => void;
    setOutputToken: (token: Token | null) => void;
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
    removeInputToken: (index?: number) => set((state: SwapStore) => {
        const tokens = [...state.inputTokens];
        tokens.splice(index ?? 0, 1);
        return { inputTokens: tokens };
    }),
    setOutputToken: (token: Token | null) => set({ outputToken: token }),
    setOutputChain: (chain: number) => set({ outputChain: chain }),
}));