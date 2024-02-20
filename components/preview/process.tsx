"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { PreviewStatus, Status } from "./status";
import React, { useState } from "react";
import { SwapButton } from "../swapbutton";
import { Approvals } from "./approvals";
import { useRouteStore } from "@/lib/core/data/routeStore";
import { getContract, zeroAddress, erc20Abi, publicActions } from "viem";
import { Review } from "./review";
import { PreviewSend } from "./send";
import { useSwapStore } from "@/lib/core/data/swapStore";
import Link from "next/link";
import { useAccount, useWalletClient } from "wagmi";
import { MUWPChain } from "@/muwp";
import { useRouter } from "next/navigation";
import { WalletAccessor, Wallets } from "./wallets";

export type NextStep = (opt?: any) => void;

export default function PreviewProcess() {
    const [status, setStatus] = useState<Status>(Status.approvals)
    const { getRoutes, routes: _route, clear, chosenIndex, multiWallets } = useRouteStore();
    const { clearSwaps } = useSwapStore();
    const [needsApproval, setNeedApprovals] = useState(true);
    const { data: walletClient } = useWalletClient()
    const { address, chain } = useAccount();

    React.useEffect(() => {
        if (address && !(multiWallets?.includes(address))) {
            const pastWallets: `0x${string}`[] = Array.isArray(multiWallets) ? multiWallets : [];
            pastWallets.push(address);
            useRouteStore.setState({ multiWallets: pastWallets });
        }
    }, [address]);

    React.useEffect(() => {
        (async () => {
            const routes = getRoutes()
            for (const route of routes) {
                if (route.fromToken.address === zeroAddress) continue;
                if (typeof walletClient === "undefined") continue;
                const client = walletClient.extend(publicActions);
                // Check allowance
                const contract = getContract({
                    address: route.fromToken.address as `0x${string}`,
                    abi: erc20Abi,
                    client
                })

                for (const address of multiWallets ?? []) {
                    let allowance = 0n
                    try {
                        allowance = await contract.read.allowance([address!, (chain as MUWPChain).muwpContract]) // TODO: Replace with router address
                    } catch (e) {
                        console.error(e);
                    }

                    console.log(allowance)

                    const amount = BigInt(route.steps[0].action.fromAmount)

                    if (allowance < amount) {
                        setNeedApprovals(true);
                        return;
                    }
                }
            }
            setNeedApprovals(false);
        })()
    }, [getRoutes()[0]?.id, multiWallets?.join(",")]);

    const [isSending, setIsSending] = useState(false);
    const [hash, setHash] = useState<string | undefined>();
    const router = useRouter();

    React.useEffect(() => {
        if (status == Status.send && !hash) {
            router.push("/transactions");
            window.location.href = "/transactions";
        }
    }, [status, hash])

    return <Dialog open={(status == Status.send || isSending) ? true : undefined}>
        <DialogTrigger className="w-full" asChild><SwapButton status={status} needsApproval={needsApproval} /></DialogTrigger>
        <DialogContent canClose={status != Status.send && isSending != true}>
            <WalletAccessor />
            <DialogHeader>
                <DialogTitle>Trade Review</DialogTitle>
            </DialogHeader>
            <PreviewStatus status={status} needsApproval={needsApproval} />
            {status == Status.approvals && needsApproval && <Approvals nextStep={() => setStatus(Status.review)} />}
            {(status == Status.review || (status == Status.approvals && !needsApproval)) && <Review nextStep={(send: string) => {
                setHash(send)
                setStatus(Status.send)
                setIsSending(false)
            }} isSending={isSending} setIsSending={setIsSending} />}
            {status == Status.send && hash && <PreviewSend hash={hash as `0x${string}`} setHash={setHash} nextStep={() => {
                clear();
                clearSwaps();
            }} />}
        </DialogContent>
    </Dialog>
}