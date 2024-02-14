'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation'
import {
    RainbowKitProvider,
    getDefaultWallets,
    connectorsForWallets,
    darkTheme,
} from '@rainbow-me/rainbowkit';
import {
    argentWallet,
    trustWallet,
    ledgerWallet,
    injectedWallet,
    tokenaryWallet
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createConfig, WagmiConfig, useNetwork, useSwitchNetwork } from 'wagmi';
import { publicProvider } from 'wagmi/providers/public';
import { useSwapStore } from '@/lib/core/data/swapStore';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { muwpChains } from '@/muwp';
import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import { ShadowWallet } from "@flipperplatform/wallet-adapter-plugin";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { NightlyWallet } from "@nightlylabs/aptos-wallet-adapter-plugin";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { PontemWallet } from "@pontem/wallet-adapter-plugin";
import { RiseWallet } from "@rise-wallet/wallet-adapter";
import { TokenPocketWallet } from "@tp-lab/aptos-wallet-adapter";
import { TrustWallet } from "@trustwallet/aptos-wallet-adapter";
import { MSafeWalletAdapter } from "@msafe/aptos-wallet-adapter";
import { WelldoneWallet } from "@welldone-studio/aptos-wallet-adapter";
import { OKXWallet } from "@okwallet/aptos-wallet-adapter";
import { OnekeyWallet } from "@onekeyfe/aptos-wallet-adapter";
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';

export const AptosWallets = [
    new FewchaWallet(),
    new ShadowWallet(),
    new MartianWallet(),
    new MSafeWalletAdapter(),
    new NightlyWallet(),
    new PetraWallet(),
    new PontemWallet(),
    new RiseWallet(),
    new TokenPocketWallet(),
    new TrustWallet(),
    new WelldoneWallet(),
    new OKXWallet(),
    new OnekeyWallet(),
];

export const { chains, publicClient, webSocketPublicClient } = configureChains(
    muwpChains,
    [publicProvider()]
);

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

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
        <AptosWalletAdapterProvider plugins={AptosWallets} onError={(e) => {
            console.error(e)
        }}>
            <WagmiConfig config={wagmiConfig}>
                <RainbowKitProvider chains={chains} appInfo={demoAppInfo} modalSize="compact" coolMode={true} theme={darkTheme()}>
                    {mounted && <State>{children}</State>}
                </RainbowKitProvider>
            </WagmiConfig>
        </AptosWalletAdapterProvider >
    </TooltipProvider>;
}
