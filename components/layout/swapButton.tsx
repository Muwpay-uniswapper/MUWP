"use client";

import { useSwapStore } from "@/lib/front/data/swapStore";
import { Button } from "../ui/button";
import { useAccount, useNetwork } from "wagmi";
import { InputType } from "@/app/api/quote/route";
import { useRouteStore } from "@/lib/front/data/routeStore";
import { Loader2 } from "lucide-react";



export function SwapButton() {
    const { inputTokens, outputToken, inputAmount, outputChain } = useSwapStore();
    const { fetchRoutes, isFetching } = useRouteStore();
    const { chain } = useNetwork();
    const { address } = useAccount();

    const onClick = async () => {
        if (!chain || !outputChain || !address || !outputToken) return;
        await fetchRoutes({
            inputAmount,
            fromAddress: address,
            inputChain: chain.id,
            inputTokens: inputTokens.map(token => ({
                address: token.address,
                value: token.value,
            })),
            outputChain,
            outputToken: {
                address: outputToken.address,
                value: outputToken.value,
            }
        })
    }

    return <Button className="w-full h-full rounded flex justify-center items-center" onClick={onClick} disabled={isFetching}>
        {isFetching && <Loader2 className="h-6 w-6 animate-spin mx-2" />}
        Find Routes
    </Button>
}