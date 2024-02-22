"use client";

import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { NightlyWallet } from "@nightlylabs/aptos-wallet-adapter-plugin";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { PontemWallet } from "@pontem/wallet-adapter-plugin";
import { RiseWallet } from "@rise-wallet/wallet-adapter";
import { TokenPocketWallet } from "@tp-lab/aptos-wallet-adapter";
import { TrustWallet } from "@trustwallet/aptos-wallet-adapter";
import { WelldoneWallet } from "@welldone-studio/aptos-wallet-adapter";
import {
    AptosWalletAdapterProvider
} from "@aptos-labs/wallet-adapter-react";
import { AutoConnectProvider } from "./AutoConnectProvider";
import { FC, ReactNode } from "react";

const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
    // const { autoConnect } = useAutoConnect();

    const wallets = [
        new FewchaWallet(),
        new MartianWallet(),
        new NightlyWallet(),
        new PetraWallet(),
        new PontemWallet(),
        new RiseWallet(),
        new TokenPocketWallet(),
        new TrustWallet(),
        new WelldoneWallet(),
    ];

    return (
        <AptosWalletAdapterProvider
            plugins={wallets}
            autoConnect={true}
            onError={(error) => {
                console.error("Custom error handling", error);
            }}
        >
            {children}
        </AptosWalletAdapterProvider>
    );
};

export const AptosContext: FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <AutoConnectProvider>
            <WalletContextProvider>{children}</WalletContextProvider>
        </AutoConnectProvider>
    );
};