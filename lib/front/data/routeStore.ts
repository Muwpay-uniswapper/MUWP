import { InputType } from '@/app/api/quote/route';
import { Route } from '@/lib/li.fi-ts';
import { create, StoreApi } from 'zustand';

type RouteStore = {
    routes: Route[];
    isFetching: boolean;
    fetchRoutes: (input: InputType) => Promise<void>;
};

declare global {
    interface BigInt {
        toJSON(): string;
    }
}

BigInt.prototype.toJSON = function () {
    return this.toString();
};

export const useRouteStore = create<RouteStore>((set: StoreApi<RouteStore>['setState'], get: StoreApi<RouteStore>['getState']) => ({
    routes: [],
    isFetching: false,
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
            const routes = await res.json();
            set({ routes, isFetching: false });
        } catch (e) {
            set({ isFetching: false });
            throw e;
        }
    }
}));
