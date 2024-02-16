'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation'
import {
    RainbowKitProvider,
    darkTheme,
} from '@rainbow-me/rainbowkit';
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, useAccount, useSwitchChain } from 'wagmi'

import { useSwapStore } from '@/lib/core/data/swapStore';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { muwpChains } from '@/muwp';
import { AptosContext } from './aptosWallet';
import { _chains } from '@rainbow-me/rainbowkit/dist/config/getDefaultConfig';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

const config = getDefaultConfig({
    appName: 'MUWPay',
    projectId: projectId,
    chains: muwpChains as any,
})

const queryClient = new QueryClient()

const muwpAppInfo = {
    appName: 'MUWP Pay',
};

export function State({ children }: { children: React.ReactNode }) {
    const [hydrated, setHydrated] = React.useState(false);
    const searchParams = useSearchParams();
    const chainId = searchParams.get('chain');
    const toChainId = searchParams.get('toChain');
    const { switchChain } = useSwitchChain();
    const { chain } = useAccount();
    const { outputChain, setOutputChain } = useSwapStore();
    const router = useRouter()

    React.useEffect(() => {
        if (hydrated) return;
        if (typeof chain == "undefined") return;
        if (chainId !== chain.id.toString()) {
            switchChain({ chainId: Number(chainId) });
        }
        if (typeof toChainId !== "undefined" && toChainId !== outputChain?.toString()) {
            setOutputChain(Number(toChainId));
        }

        setHydrated(true);
    }, [hydrated, chainId, chain]);

    React.useEffect(() => {
        if (!hydrated) return;
        if (typeof window !== 'undefined') {
            const newParams = new URLSearchParams(window.location.search);
            if (chain) newParams.set('chain', chain.id.toString());
            if (outputChain) newParams.set('toChain', outputChain.toString());

            // Just append the new params to the path.
            router.push(`${window.location.pathname}?${newParams.toString()}`);
        }
    }, [chain, outputChain, router]);

    return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    return <TooltipProvider skipDelayDuration={250} delayDuration={300}>
        <Toaster richColors />
        <AptosContext>
            <WagmiProvider config={config}>
                <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider appInfo={muwpAppInfo} modalSize="compact" coolMode={true} theme={darkTheme()}>
                        {mounted && <State>{children}</State>}
                    </RainbowKitProvider>
                </QueryClientProvider>
            </WagmiProvider>
        </AptosContext>
    </TooltipProvider>;
}
