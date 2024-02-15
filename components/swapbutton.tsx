"use client";

import { Button } from "./ui/button";
import { useRouteStore } from "@/lib/core/data/routeStore";
import React from "react";
import { Status } from "./preview/status";

export const SwapButton = React.forwardRef<HTMLButtonElement, {
    status: Status,
    needsApproval: boolean
}>(({
    status,
    needsApproval,
    ...props
}, forwardedRef) => {
    const { tempAccount } = useRouteStore();

    return (
        <Button {...props} ref={forwardedRef} className="w-full h-full max-h-14 mt-4 rounded flex justify-center items-center" disabled={!tempAccount}>
            {status === Status.approvals && needsApproval && "Approve"}
            {(status === Status.review || (status === Status.approvals && !needsApproval)) && "Review"}
            {status === Status.send && "Swap"}
        </Button >
    );
});
