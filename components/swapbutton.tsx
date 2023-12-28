"use client";

import { Button } from "./ui/button";
import { erc20ABI, useAccount, useFeeData, useNetwork, usePublicClient, useWaitForTransaction, useWalletClient } from "wagmi";
import { useRouteStore } from "@/lib/front/data/routeStore";
import { Loader2 } from "lucide-react";
import React from "react";
import { z } from "zod";
import { PrepareTransactionRequestReturnType, getContract, zeroAddress } from "viem";
import { toast } from "sonner";
import { MUWPChain } from "@/muwp";
import { useRouter } from "next/navigation";

export function SwapButton() {
    const { getRoutes, tempAccount, routes: _route } = useRouteStore();
    const { data: walletClient } = useWalletClient()
    const publicClient = usePublicClient()
    const account = useAccount();
    const { chain } = useNetwork();

    const routes = React.useMemo(() => getRoutes(), [_route])

    const [needApprovals, setNeedApprovals] = React.useState(false);

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

                const allowance = await contract.read.allowance([account.address!, (chain as MUWPChain).muwpContract]) // TODO: Replace with router address

                const amount = BigInt(route.steps[0].action.fromAmount)

                if (allowance < amount) {
                    setNeedApprovals(true);
                    return;
                }
            }
            setNeedApprovals(false);
        })()
    }, [routes])

    return <Button className="w-full h-full max-h-14 mt-4 rounded flex justify-center items-center" disabled={!tempAccount}>
        {needApprovals ? "Approve & Swap" : "Swap"}
    </Button >
}