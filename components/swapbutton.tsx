"use client";

import { useSwapStore } from "@/lib/front/data/swapStore";
import { Button } from "./ui/button";
import { erc20ABI, useAccount, useFeeData, useNetwork, usePublicClient, useWaitForTransaction, useWalletClient } from "wagmi";
import { InputType } from "@/app/api/quote/route";
import { useRouteStore } from "@/lib/front/data/routeStore";
import { Loader2 } from "lucide-react";
import React from "react";
import { z } from "zod";
import { PrepareTransactionRequestReturnType, getContract, zeroAddress } from "viem";
import { toast } from "sonner";

const InitiateResponse = z.object({
    status: z.literal("success"),
    address: z.string(),
    txn: z.any(),
    approvals: z.array(z.any()),
});

export function SwapButton() {
    const { getRoutes, tempAccount } = useRouteStore();
    const { data: walletClient } = useWalletClient()
    const publicClient = usePublicClient()
    const account = useAccount();
    const { chain } = useNetwork();
    const { data } = useFeeData()
    const [hash, setHash] = React.useState<`0x${string}` | undefined>();

    const { isError, isLoading } = useWaitForTransaction({ hash })
    const [isFetching, setIsFetching] = React.useState(false);

    React.useEffect(() => {
        if (hash && !isError && !isLoading && isFetching) {
            (async () => {
                const notifyBackend = await fetch("/api/receive-funds", {
                    method: "POST",
                    body: JSON.stringify({
                        chainId: chain?.id,
                        transactionHash: hash,
                        accountAddress: tempAccount
                    }),
                    headers: {
                        "Content-Type": "application/json"
                    }
                }).then((res) => res.json());

                setIsFetching(false);
                setHash(undefined);
            })();
        }
    }, [hash, isError, isLoading])

    const onClick = async () => {
        setIsFetching(true);
        const routes = getRoutes()
        // Process allowance
        const allowances = Promise.all(routes.map(async (route) => {
            if (route.fromToken.address !== zeroAddress) {
                // Check allowance
                const contract = getContract({
                    address: route.fromToken.address as `0x${string}`,
                    abi: erc20ABI,
                    publicClient: publicClient!,
                    walletClient: walletClient!,
                })

                const allowance = await contract.read.allowance([account.address!, "0xADf1687e201d1DCb466D902F350499D008811e84"]) // TODO: Replace with router address

                const amount = BigInt(route.steps[0].action.fromAmount)

                if (allowance < amount) {
                    const hash = await contract.write.approve(["0xADf1687e201d1DCb466D902F350499D008811e84", amount])

                    await publicClient.waitForTransactionReceipt({ hash })
                }
            }
        }))

        await new Promise((resolve, reject) => {
            toast.promise(allowances, {
                loading: 'Waiting for approvals...',
                success: (data) => {
                    resolve(data);
                    return `Approvals successful`;
                },
                error: (e) => {
                    reject(e);
                    setIsFetching(false);
                    return 'Could not approve tokens'
                },
            });
        })

        const _res = fetch("/api/initiate", {
            method: "POST",
            body: JSON.stringify({
                from: account.address,
                account: tempAccount,
                chainId: chain?.id,
                routes,
                maxFeePerGas: data?.maxFeePerGas,
                maxPriorityFeePerGas: data?.maxPriorityFeePerGas,
            }),
            headers: {
                "Content-Type": "application/json"
            }
        }).then((res) => res.json());

        const res = await new Promise((resolve, reject) => {
            toast.promise(_res, {
                loading: 'Loading the transaction data...',
                success: (data) => {
                    resolve(data);
                    return `Transaction data loaded`;
                },
                error: (e) => {
                    reject(e);
                    setIsFetching(false);
                    return 'Could not load transaction data'
                }
            });
        })

        const { address, approvals, txn } = await InitiateResponse.parseAsync(res);

        // Approve tokens
        let _hash: `0x${string}` | undefined;
        let counter = 0;
        do {
            counter++;
            // for (const approval of approvals) {
            //     const hash = await walletClient?.sendTransaction(approval as PrepareTransactionRequestReturnType);
            // }

            const __hash = walletClient?.sendTransaction(txn as PrepareTransactionRequestReturnType);

            if (!__hash) continue;

            _hash = await new Promise((resolve, reject) => {
                toast.promise(__hash, {
                    loading: 'Sending transaction...',
                    success: (data) => {
                        resolve(data);
                        return `Transaction sent`;
                    },
                    error: (e) => {
                        reject(e);
                        setIsFetching(false);
                        return 'Could not send transaction... trying again'
                    }
                });
            })

            setHash(_hash);
        } while (!_hash && counter < 3);

        if (!_hash) {
            toast.error("Could not send transaction")
            setIsFetching(false);
        }
    }

    return <Button className="w-full h-full max-h-14 mt-4 rounded flex justify-center items-center" onClick={() => {
        if (!tempAccount) return;
        try {
            onClick()
        } catch (e) {
            setIsFetching(false);
            toast.error("Error swapping")
        }
    }} disabled={isFetching || !tempAccount}>
        {isFetching && <Loader2 className="h-6 w-6 animate-spin mx-2" />}
        Swap
    </Button >
}