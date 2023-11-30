"use client";

import { useSwapStore } from "@/lib/front/data/swapStore";
import { Button } from "./ui/button";
import { useAccount, useNetwork } from "wagmi";
import { InputType } from "@/app/api/quote/route";
import { useRouteStore } from "@/lib/front/data/routeStore";
import { Loader2 } from "lucide-react";
import React from "react";



export function SwapButton() {
    const { getRoutes } = useRouteStore();
    const [isFetching, setIsFetching] = React.useState(false);

    const onClick = async () => {
        const address = await fetch("/api/initiate", {
            method: "POST",
            body: JSON.stringify(getRoutes()),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => res.text());
        alert(address);
    }

    return <Button className="w-full h-full rounded flex justify-center items-center" onClick={onClick} disabled={isFetching}>
        {isFetching && <Loader2 className="h-6 w-6 animate-spin mx-2" />}
        Swap
    </Button>
}