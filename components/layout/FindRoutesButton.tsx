"use client";

import { useSwapStore } from "@/lib/core/data/swapStore";
import { Button } from "../ui/button";
import { useAccount } from "wagmi";
import { useRouteStore } from "@/lib/core/data/routeStore";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import React, { useState } from "react";



export function FindRoutesButton() {
    const { inputTokens, outputTokens, inputAmount, outputChain, allowDenyBridges, allowDenyExchanges, outputDistribution, targetAddress } = useSwapStore();
    const { fetchRoutes, isFetching, tempAccount, validUntil } = useRouteStore();
    const { address, chain } = useAccount();
    const [trials, setTrials] = useState(0);
    React.useEffect(() => {
        const interval = setInterval(async () => {
            if (process.env.NODE_ENV !== "production") return;
            if (validUntil && validUntil < new Date() && !isFetching && trials <= 3) {
                await onClick();
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [validUntil, isFetching]);

    const onClick = async () => {
        if (!chain || !outputChain || !address || !outputTokens) return;
        try {
            const distribution = outputDistribution.map((a, i, arr) => a - (arr[i - 1] ?? 0));
            distribution.push(100 - distribution.reduce((a, b) => a + b, 0));

            await fetchRoutes({
                inputAmount,
                fromAddress: address,
                toAddress: targetAddress,
                inputChain: chain.id,
                inputTokens: inputTokens.map(token => ({
                    address: token.address,
                    value: token.value,
                })),
                outputChain,
                outputTokens: outputTokens.map(token => ({
                    address: token.address,
                    value: token.value,
                })),
                distribution,
                tempAccount,
                options: {
                    bridges: allowDenyBridges,
                    exchanges: allowDenyExchanges,
                }
            })

            setTrials(0);
        } catch (e) {
            toast.error("Error fetching routes", {
                description: <>{e instanceof Error && e.message}<br />Maybe try a different route!</>
            })
            if (validUntil && validUntil < new Date()) {
                setTrials(trials + 1);
            }
        }
    }

    return <>
        <Button className="w-full h-full rounded flex justify-center items-center" onClick={onClick} disabled={isFetching}>
            {isFetching && <Loader2 className="h-6 w-6 animate-spin mx-2" />}
            Find Routes
        </Button>
    </>
}