import { InputType } from '@/app/api/quote/route';
import { Route } from '@/lib/li.fi-ts';
import { Edge, FitView, Node, SetCenter } from 'reactflow';
import { z } from 'zod';
import { create, StoreApi } from 'zustand';
import { useSwapStore } from './swapStore';
import { persist } from 'zustand/middleware'

export type Transaction = {
    routes: Route[];
    id: string;
    timestamp: number;
    status: {
        completed: number;
        errors?: {
            [key: string]: string;
        }
    }
};

type RouteStore = {
    multiWallets?: `0x${string}`[];
    multiWalletDistribution: { [key: string]: { [key: string]: bigint } }; // token -> wallet -> amount
    tempAccount: `0x${string}` | undefined;
    transactions: Transaction[];
    setTransaction: (transaction: Transaction) => void;
    deleteTransaction: (transaction: Transaction) => void;
    validUntil?: Date;
    needsUpdate: boolean;
    forceUpdate: () => void;
    routes: { [key: string]: Route[] };
    chosenIndex: { [key: string]: number };
    getRoutes: () => Route[];
    choseIndex: (key: string, index: number) => void;
    isFetching: boolean;
    fetchRoutes: (input: InputType) => Promise<void>;
    isFocused: boolean;
    setFocused: (
        nodes: Node[],
        edge: Edge | null,
        setNodes: React.Dispatch<React.SetStateAction<Node<any, string | undefined>[]>>,
        setEdges: React.Dispatch<React.SetStateAction<Edge<string | undefined>[]>>,
        setCenter: SetCenter,
        fitView: FitView
    ) => void;
    focusedPoint: { x1: number, y1: number, x2: number, y2: number };
    setFocusedPoint: (point: { x1: number, y1: number, x2: number, y2: number }) => void;
    clear: () => void;
};

declare global {
    interface BigInt {
        toJSON(): string;
    }
}

BigInt.prototype.toJSON = function () {
    return this.toString();
};

export const useRouteStore = create<RouteStore>()(persist((set: StoreApi<RouteStore>['setState'], get: StoreApi<RouteStore>['getState']) => ({
    multiWallets: undefined,
    multiWalletDistribution: {},
    tempAccount: undefined,
    transactions: [],
    setTransaction: (transaction: Transaction) => {
        const { transactions } = get();
        const tx = transactions.findIndex((tx) => tx.id === transaction.id);
        if (tx === -1) {
            set({ transactions: [...transactions, transaction] });
        } else {
            set((state) => {
                state.transactions[tx] = transaction;
                return { transactions: state.transactions };
            });
        }
    },
    deleteTransaction: (transaction: Transaction) => {
        const { transactions } = get();
        const tx = transactions.findIndex((tx) => tx.id === transaction.id);
        if (tx !== -1) {
            set({ transactions: transactions.filter((_, i) => i !== tx) });
        }
    },
    needsUpdate: false,
    validUntil: undefined,
    forceUpdate: () => set({ needsUpdate: !get().needsUpdate }),
    routes: {},
    chosenIndex: {},
    getRoutes: () => {
        const { routes, chosenIndex } = get();
        return Object.keys(routes).map((key) => routes[key][chosenIndex[key] ?? 0]);
    },
    choseIndex: (key: string, index: number) => set((state) => {
        state.chosenIndex[key] = index;
        return { chosenIndex: state.chosenIndex, needsUpdate: !state.needsUpdate };
    }),
    isFetching: false,
    isFocused: false,
    fetchRoutes: async (input: InputType) => {
        set({ isFetching: true });
        try {
            const res = await fetch(`/api/quote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(input),
            });
            const json = await res.json();
            if (json.message) {
                throw new Error(json.message)
            }
            const routes = await z.object({
                routes: z.record(Route.zod.array()),
                tempAccount: z.string(),
                validUntil: z.coerce.date(),
            }).parseAsync(json);

            const chosenIndex = Object.keys(routes.routes).reduce((acc, key) => {
                acc[key] = 0;
                return acc;
            }, {} as { [key: string]: number });

            useSwapStore.setState({});
            const multiWalletDistribution = Object.fromEntries(input.inputTokens.map((token) => [token.address, {}]))

            set({
                routes: routes.routes as any,
                tempAccount: routes.tempAccount as `0x${string}`,
                chosenIndex,
                isFetching: false,
                validUntil: routes.validUntil,
                multiWalletDistribution
            });
        } catch (e) {
            set({ isFetching: false });
            throw e;
        }
    },
    focusedPoint: { x1: 0, y1: 0, x2: 0, y2: 0 },
    setFocusedPoint: (point: { x1: number, y1: number, x2: number, y2: number }) => set({ focusedPoint: point }),
    setFocused: (
        nodes: Node[],
        edge: Edge | null,
        setNodes: React.Dispatch<React.SetStateAction<Node<any, string | undefined>[]>>,
        setEdges: React.Dispatch<React.SetStateAction<Edge<string | undefined>[]>>,
        setCenter: SetCenter,
        fitView: FitView
    ) => set((state) => {
        const sourceNode = nodes.find((node) => node.id === edge?.source);
        const targetNode = nodes.find((node) => node.id === edge?.target);

        if (!state.isFocused) {
            state.focusedPoint = {
                x1: sourceNode?.position.x || 0,
                y1: sourceNode?.position.y || 0,
                x2: targetNode?.position.x || 0,
                y2: targetNode?.position.y || 0,
            }

            setCenter(150 + 200, 150, { duration: 500, zoom: 1 });
        } else {
            setTimeout(() => {
                fitView({ duration: 500, includeHiddenNodes: true })
            }, 50);
        }

        const _isFocused = !state.isFocused;
        setNodes((nodes: Node[]) => {
            // Hide all other nodes
            const newNodes = nodes.map((node) => {
                if (node.id === edge?.source) {
                    return {
                        ...node,
                        position: {
                            x: _isFocused ? 0 : state.focusedPoint.x1,
                            y: _isFocused ? 0 : state.focusedPoint.y1,
                        },
                        data: {
                            ...node.data,
                            isSource: _isFocused,
                        }
                    }
                } else if (node.id === edge?.target) {
                    return {
                        ...node,
                        position: {
                            x: _isFocused ? 0 : state.focusedPoint.x2,
                            y: _isFocused ? 250 : state.focusedPoint.y2,
                        },
                        data: {
                            ...node.data,
                            source: _isFocused ? edge.source : undefined,
                        }
                    }
                } else if (node.type == "detail") {
                    return {
                        ...node,
                        position: {
                            x: _isFocused ? 100 + 200 : 100 + 200,
                            y: _isFocused ? 0 : 0,
                        },
                        hidden: !_isFocused,
                        style: {
                            ...node.style,
                            opacity: (_isFocused && node.id === `${edge?.id}-detail`) ? 1 : 0,
                            pointerEvents: (_isFocused && node.id === `${edge?.id}-detail`) ? 'all' : 'none',
                        },
                    }
                }
                return {
                    ...node,
                    style: {
                        ...node.style,
                        opacity: _isFocused ? 0 : 1,
                        isSource: false,
                        source: undefined,
                        pointerEvents: node.data.isInput ? 'all' : 'none',
                    }
                };
            })

            return newNodes as Node[];
        })
        setEdges((edges) => {
            // Hide all other edges
            return edges.map((_edge) => {
                if (_edge.id !== edge?.id) {
                    return {
                        ..._edge,
                        style: {
                            ..._edge.style,
                            opacity: _isFocused ? 0 : 1,
                        }
                    };
                }
                return _edge;
            })
        })

        return { isFocused: _isFocused, focusedPoint: state.focusedPoint };
    }),
    clear: () => set({
        routes: {},
        chosenIndex: {},
        tempAccount: undefined
    }),
}), {
    name: 'routeStore',
    partialize: (state) => ({
        transactions: state.transactions
    })
}));
