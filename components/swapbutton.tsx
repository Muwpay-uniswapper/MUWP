"use client";

import { Button } from "./ui/button";
import { useRouteStore } from "@/lib/core/data/routeStore";
import React from "react";
import { Status } from "./preview/status";

export function SwapButton({
    status,
    needsApproval
}: {
    status: Status,
    needsApproval: boolean
}) {
    const { tempAccount } = useRouteStore();

    return <Button className="w-full h-full max-h-14 mt-4 rounded flex justify-center items-center" disabled={!tempAccount}>
        {status == Status.approvals && needsApproval && "Approve"}
        {(status == Status.review || (status == Status.approvals && !needsApproval)) && "Review"}
        {status == Status.send && "Swap"}
    </Button >
}