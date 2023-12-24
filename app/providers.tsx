'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation'
import {
    RainbowKitProvider,
    getDefaultWallets,
    connectorsForWallets,
    darkTheme,
    Chain
} from '@rainbow-me/rainbowkit';
import {
    argentWallet,
    trustWallet,
    ledgerWallet,
    injectedWallet,
    tokenaryWallet
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig, useNetwork, useSwitchNetwork } from 'wagmi';
import {
    mainnet,
    polygon,
    optimism,
    arbitrum,
    bsc,
    zkSync,
    polygonZkEvm,
    base,
    avalanche,
    linea,
    gnosis,
    fantom,
    moonriver,
    moonbeam,
    fuse,
    okc,
    boba,
    aurora,
    goerli,
    polygonMumbai
} from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { useSwapStore } from '@/lib/front/data/swapStore';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';

export interface MUWPChain extends Chain {
    muwpContract: `0x${string}`;
}

export const muwpChains: MUWPChain[] = [
    { ...mainnet, muwpContract: "0x" },
    { ...arbitrum, muwpContract: "0x" },
    { ...optimism, muwpContract: "0x" },
    { ...polygon, muwpContract: "0x" },
    { ...bsc, muwpContract: "0x" },
    { ...zkSync, muwpContract: "0x" },
    { ...polygonZkEvm, muwpContract: "0x" },
    { ...base, muwpContract: "0x" },
    { ...avalanche, muwpContract: "0x" },
    { ...linea, muwpContract: "0x" },
    { ...gnosis, muwpContract: "0x" },
    { ...fantom, muwpContract: "0x" },
    { ...moonriver, muwpContract: "0x" },
    { ...moonbeam, muwpContract: "0x" },
    { ...fuse, muwpContract: "0x" },
    { ...okc, muwpContract: "0x" },
    { ...boba, muwpContract: "0x" },
    { ...aurora, muwpContract: "0x" },
    ...(process.env.NODE_ENV !== 'production' ? [
        { ...goerli, muwpContract: "0xADf1687e201d1DCb466D902F350499D008811e84" },
        { ...polygonMumbai, muwpContract: "0x" }
    ] : []),
]

export const { chains, publicClient, webSocketPublicClient } = configureChains(
    muwpChains,
    [publicProvider()]
);

const projectId = 'YOUR_PROJECT_ID';

const { wallets } = getDefaultWallets({
    appName: 'MUWP Pay',
    projectId,
    chains,
});

const demoAppInfo = {
    appName: 'MUWP Pay',
};

const connectors = connectorsForWallets([
    ...wallets,
    {
        groupName: 'Other',
        wallets: [
            injectedWallet({ chains }),
            argentWallet({ projectId, chains }),
            trustWallet({ projectId, chains }),
            ledgerWallet({ projectId, chains }),
            tokenaryWallet({ chains }),
        ],
    },
]);

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors,
    publicClient,
    webSocketPublicClient,
});

export function State({ children }: { children: React.ReactNode }) {
    const [hydrated, setHydrated] = React.useState(false);
    const searchParams = useSearchParams();
    const chainId = searchParams.get('chain');
    const toChainId = searchParams.get('toChain');
    const { switchNetwork } = useSwitchNetwork();
    const { chain } = useNetwork();
    const { outputChain, setOutputChain } = useSwapStore();
    const router = useRouter()

    React.useEffect(() => {
        if (hydrated) return;
        if (typeof chain == "undefined" || typeof switchNetwork == "undefined") return;
        if (chainId !== chain.id.toString()) {
            switchNetwork?.(Number(chainId));
        }
        if (typeof toChainId !== "undefined" && toChainId !== outputChain?.toString()) {
            setOutputChain(Number(toChainId));
        }

        setHydrated(true);
    }, [hydrated, chainId, chain, switchNetwork]);

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
        <WagmiConfig config={wagmiConfig}>
            <RainbowKitProvider chains={chains} appInfo={demoAppInfo} modalSize="compact" coolMode={true} theme={darkTheme()}>
                {mounted && <State>{children}</State>}
            </RainbowKitProvider>
        </WagmiConfig>
    </TooltipProvider>;
}
