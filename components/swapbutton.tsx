"use client";

import { useSwapStore } from "@/lib/front/data/swapStore";
import { Button } from "./ui/button";
import { useAccount, useFeeData, useNetwork, useWaitForTransaction, useWalletClient } from "wagmi";
import { InputType } from "@/app/api/quote/route";
import { useRouteStore } from "@/lib/front/data/routeStore";
import { Loader2 } from "lucide-react";
import React from "react";
import { z } from "zod";
import { PrepareTransactionRequestReturnType } from "viem";

const InitiateResponse = z.object({
    status: z.literal("success"),
    address: z.string(),
    txn: z.any(),
    approvals: z.array(z.any()),
});

export function SwapButton() {
    const { getRoutes } = useRouteStore();
    const { data: walletClient } = useWalletClient()
    const account = useAccount();
    const { chain } = useNetwork();
    const { data } = useFeeData()
    const [hash, setHash] = React.useState<`0x${string}` | undefined>();
    const [accountAddress, setAccountAddress] = React.useState<string | undefined>();
    const { isError, isLoading } = useWaitForTransaction({ hash })
    const [isFetching, setIsFetching] = React.useState(false);

    React.useEffect(() => {
        if (hash && !isError && !isLoading) {
            (async () => {
                const notifyBackend = await fetch("/api/receive-funds", {
                    method: "POST",
                    body: JSON.stringify({
                        chainId: chain?.id,
                        transactionHash: hash,
                        accountAddress,
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then((res) => res.json());

                setIsFetching(false);
            })();
        }
    }, [hash, isError, isLoading])

    const onClick = async () => {
        setIsFetching(true);
        const res = await fetch("/api/initiate", {
            method: "POST",
            body: JSON.stringify({
                from: account.address,
                chainId: chain?.id,
                routes: getRoutes(),
                maxFeePerGas: data?.maxFeePerGas,
                maxPriorityFeePerGas: data?.maxPriorityFeePerGas,
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => res.json());

        const { address, approvals, txn } = InitiateResponse.parse(res);

        // Approve tokens
        for (const approval of approvals) {
            const hash = await walletClient?.sendTransaction(approval as PrepareTransactionRequestReturnType);
            alert(`Approving ${approval.to} with hash ${hash}`);

        }

        const _hash = await walletClient?.sendTransaction(txn as PrepareTransactionRequestReturnType);

        setAccountAddress(address);
        setHash(_hash);
    }

    return <Button className="w-full h-full rounded flex justify-center items-center" onClick={onClick} disabled={isFetching}>
        {isFetching && <Loader2 className="h-6 w-6 animate-spin mx-2" />}
        Swap
    </Button >
}