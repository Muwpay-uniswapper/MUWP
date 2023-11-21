"use client";

import { ConnectButton as ConnectRainbow } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi'
export function ConnectButton({
    not = false,
    asChild = false,
    className = "",
    accountStatus = "avatar",
    chainStatus = "none"
}: {
    not?: boolean,
    asChild?: boolean,
    className?: string,
    accountStatus?: string,
    chainStatus?: string
}) {
    const { isConnected } = useAccount();
    if (asChild) {
        return <>
            {isConnected ^ not ? <div className={className}>
                <ConnectRainbow />
            </div> : ""}
        </>
    }

    return <>
        {isConnected ^ not ? <ConnectRainbow
            accountStatus={accountStatus as any}
            chainStatus={chainStatus as any}
            showBalance={false}
        /> : ""}
    </>
}