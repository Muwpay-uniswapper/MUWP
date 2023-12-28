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
import { zeroAddress } from "viem";
import { Review } from "./review";
import { PreviewSend } from "./send";
import { useSwapStore } from "@/lib/front/data/swapStore";

export type NextStep = (opt?: any) => void;

export default function PreviewProcess() {
    const [status, setStatus] = useState<Status>(Status.approvals)
    const { getRoutes, routes: _route, clear } = useRouteStore();
    const { clearSwaps } = useSwapStore();
    const needsApproval = React.useMemo(() => getRoutes().filter(route => route.fromToken.address !== zeroAddress).length > 0, [_route])
    const [isSending, setIsSending] = useState(false);
    const [hash, setHash] = useState<string | undefined>();

    return <Dialog open={(status == Status.send || isSending) ? true : undefined}>
        <DialogTrigger className="w-full"><SwapButton /></DialogTrigger>
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
                {status == Status.send && !hash && <div>Loading...</div>}
            </DialogHeader>
        </DialogContent>
    </Dialog>
}