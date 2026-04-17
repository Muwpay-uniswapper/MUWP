import { useRouter } from 'next/router';
import { useCallback } from 'react';

export function useUrlSearchParams() {
    const router = useRouter();

    // Function to get a param value with a specified key
    const getParam = useCallback(
        (key: string) => {
            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                return params.get(key);
            }
        },
        [router.query],
    );

    // Function to set param value with a specified key
    const setParam = useCallback(
        (key: string, value: string) => {
            const params = new URLSearchParams(window.location.search);
            params.set(key, value);
            router.replace({
                pathname: router.pathname,
                query: Object.fromEntries(params),
            }, undefined, { scroll: false });
        },
        [router],
    );

    return [getParam, setParam];
}