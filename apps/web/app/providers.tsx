"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider, useAccount, useSwitchChain, createConfig } from "wagmi";

import { useSwapStore } from "@/lib/core/data/swapStore";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { muwpChains } from "@/muwp";
import { AptosContext } from "./aptosWallet";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

// const config = getDefaultConfig({
//     appName: 'MUWPay',
//     projectId: projectId,
//     chains: muwpChains as any,
//     multiInjectedProviderDiscovery: true,
//     ssr: true
// })

const config = createConfig(
  getDefaultConfig({
    // Your dApps chains
    chains: muwpChains,

    // Required API Keys
    walletConnectProjectId: projectId,

    // Required App Info
    appName: "MUWPay",

    // Optional App Info
    appDescription:
      "MUWPay is a decentralized finance (DeFi) platform that aims to provide a seamless and secure way to transfer assets across different blockchains.",
    appUrl: "https://muwp.xyz", // your app's url
    appIcon: "https://muwp.xyz/muwpayLogoIcon.svg",

    ssr: true,
  }),
);

const queryClient = new QueryClient();

const muwpAppInfo = {
  appName: "MUWP Pay",
};

export function State({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = React.useState(false);
  const searchParams = useSearchParams();
  const path = usePathname();
  const chainId = searchParams?.get("chain");
  const toChainId = searchParams?.get("toChain");
  const { switchChain } = useSwitchChain();
  const { chain } = useAccount();
  const { outputChain, setOutputChain } = useSwapStore();
  const router = useRouter();

  React.useEffect(() => {
    if (hydrated) return;
    if (typeof chain === "undefined") return;
    if (chainId !== chain.id.toString()) {
      switchChain({ chainId: Number(chainId) });
    }
    if (
      typeof toChainId !== "undefined" &&
      toChainId !== outputChain?.toString()
    ) {
      setOutputChain(Number(toChainId));
    }

    setHydrated(true);
  }, [
    hydrated,
    chainId,
    chain,
    toChainId,
    outputChain,
    switchChain,
    setOutputChain,
  ]);

  React.useEffect(() => {
    if (!hydrated) return;

    const newParams = new URLSearchParams(searchParams?.toString());
    if (chain) newParams.set("chain", chain.id.toString());
    if (outputChain) newParams.set("toChain", outputChain.toString());

    // Just append the new params to the path.
    router.replace(`${path}?${newParams.toString()}`, {
      scroll: false,
    });

    console.log(`-> ${newParams.toString()}`);
  }, [chain, hydrated, outputChain, router, searchParams]);

  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <TooltipProvider skipDelayDuration={250} delayDuration={300}>
      <Toaster richColors />
      <AptosContext>
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <ConnectKitProvider
              options={{
                initialChainId:
                  (typeof window !== "undefined" &&
                    Number(
                      new URLSearchParams(window.location.search).get("chain"),
                    )) ||
                  1,
              }}
            >
              {mounted && <State>{children}</State>}
            </ConnectKitProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </AptosContext>
    </TooltipProvider>
  );
}
