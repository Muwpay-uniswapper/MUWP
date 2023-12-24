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
import { Route } from "@/lib/li.fi-ts";
import { MUWPChain } from "@/app/providers";
import { useRouter } from "next/navigation";

const InitiateResponse = z.object({
    status: z.literal("success"),
    address: z.string(),
    txn: z.any(),
    approvals: z.array(z.any()),
    id: z.string(),
});

export function SwapButton() {
    const { getRoutes, tempAccount, routes: _route, setTransaction } = useRouteStore();
    const { data: walletClient } = useWalletClient()
    const publicClient = usePublicClient()
    const account = useAccount();
    const { chain } = useNetwork();
    const { data } = useFeeData();
    const router = useRouter();
    const [hash, setHash] = React.useState<`0x${string}` | undefined>();

    const { isError, isLoading } = useWaitForTransaction({ hash })
    const [isFetching, setIsFetching] = React.useState(false);

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

    React.useEffect(() => {
        if (!hash) return;
        if (isError) {
            toast.error("Could not wait for transaction")
        }

        if (hash && !isLoading && isFetching) {
            (async () => {

                let retries = 3;
                while (retries > 0) {
                    try {
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

                        if ((notifyBackend as any).status === "success") {
                            router.push("/transactions");
                            setHash(undefined);
                            break;
                        } else {
                            retries--;
                            if (retries === 0) {
                                toast.error("Could not notify backend after several attempts")
                            }
                        }
                    } catch (err) {
                        retries--;
                        if (retries === 0) {
                            toast.error("Could not notify backend after several attempts")
                        }
                    } finally {
                        setIsFetching(false);
                    }
                }
            })();
        }
    }, [hash, isError, isLoading])


    const onClick = async () => {
        setIsFetching(true);
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

                const allowance = await contract.read.allowance([account.address!, (chain as MUWPChain).muwpContract]) // TODO: Replace with router address

                const amount = BigInt(route.steps[0].action.fromAmount)

                if (allowance < amount) {
                    const hash = await contract.write.approve([(chain as MUWPChain).muwpContract, amount])

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

            setTransaction({
                routes,
                timestamp: Date.now(),
                id: address,
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
        {needApprovals ? "Approve & Swap" : "Swap"}
    </Button >
}