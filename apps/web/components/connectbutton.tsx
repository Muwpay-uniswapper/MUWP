"use client";

import { Avatar, ConnectKitButton, useModal } from 'connectkit';
import { useAccount } from 'wagmi'
import { Button } from './ui/button';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/core/utils';
import React, { useEffect } from 'react';
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
    const { open } = useModal();
    const [position, setPosition] = React.useState({ x: 0, y: 0 });
    useEffect(() => {
        const interval = setInterval(() => {
            const dialog = document.getElementById("__CONNECTKIT__")?.querySelector(".active > div:nth-child(3) > div");
            if (dialog) {
                const { x, y } = dialog.getBoundingClientRect();
                setPosition({ x, y });
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);
    if (asChild) {
        return <>
            {isConnected !== not ? <div className={className}>
                <ConnectKitButton />
            </div> : ""}
        </>
    }

    if (!isConnected) return <></>;

    const onClick = (show?: () => void) => {
        show?.();
    }

    return <>
        <ConnectKitButton.Custom>
            {({ isConnected, isConnecting, show, hide, address, ensName, chain }) => {
                return (
                    <Button
                        className={cn("bg-black text-white h-auto", className)}
                        onClick={() => onClick(show)}
                    >
                        <Avatar address={address} size={28} />
                        <ChevronDown />
                    </Button>
                );
            }}
        </ConnectKitButton.Custom>
    </>
}