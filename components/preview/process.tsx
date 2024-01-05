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
import { useRouteStore } from "@/lib/front/data/routeStore";
import { getContract, zeroAddress } from "viem";
import { Review } from "./review";
import { PreviewSend } from "./send";
import { useSwapStore } from "@/lib/front/data/swapStore";
import Link from "next/link";
import { erc20ABI, useAccount, useNetwork, usePublicClient, useWalletClient } from "wagmi";
import { MUWPChain } from "@/muwp";
import { useRouter } from "next/navigation";

export type NextStep = (opt?: any) => void;

export default function PreviewProcess() {
    const [status, setStatus] = useState<Status>(Status.approvals)
    const { getRoutes, routes: _route, clear } = useRouteStore();
    const { clearSwaps } = useSwapStore();
    const [needsApproval, setNeedApprovals] = useState(true);
    const { data: walletClient } = useWalletClient()
    const publicClient = usePublicClient()
    const account = useAccount()
    const { chain } = useNetwork()
    React.useEffect(() => {
        (async () => {
            const routes = getRoutes()
            for (const route of routes) {
                if (route.fromToken.address === zeroAddress) continue;
                // Check allowance
                const contract = getContract({
                    address: route.fromToken.address as `0x${string}`,
                    abi: erc20ABI,
                    publicClient: publicClient!,
                    walletClient: walletClient!,
                })

                let allowance = 0n
                try {
                    allowance = await contract.read.allowance([account.address!, (chain as MUWPChain).muwpContract]) // TODO: Replace with router address
                } catch (e) {
                    console.error(e);
                }

                const amount = BigInt(route.steps[0].action.fromAmount)

                if (allowance < amount) {
                    setNeedApprovals(true);
                    return;
                }
            }
            setNeedApprovals(false);
        })()
    }, [_route])

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
        <DialogTrigger className="w-full"><SwapButton status={status} needsApproval={needsApproval} /></DialogTrigger>
        <DialogContent canClose={status != Status.send && isSending != true}>
            <DialogHeader>
                <DialogTitle>Trade Review</DialogTitle>
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
            </DialogHeader>
        </DialogContent>
    </Dialog>
}