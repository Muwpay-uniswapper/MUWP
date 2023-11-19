"use client";

import { ConnectButton as ConnectRainbow } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi'
export function ConnectButton({
    not = false,
    asChild = false,
    className = ""
}: {
    not: boolean,
    asChild: boolean,
    className: string
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
        {isConnected ^ not ? <ConnectRainbow {...arguments} /> : ""}
    </>
}