import { useRouteStore } from "@/lib/front/data/routeStore";
import { ArrowLeftRight, DollarSign, Fuel, Layers2, Loader2, PercentCircle, Receipt } from "lucide-react";
import React from "react";
import { PrepareTransactionRequestReturnType, formatUnits } from "viem";
import { Button } from "../ui/button";
import { NextStep } from "./process";
import { format } from "../flow/DetailNode";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Funnel } from "./funnel";
import { useAccount, useFeeData, useNetwork, usePublicClient, useWalletClient } from "wagmi";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";

const InitiateResponse = z.object({
    status: z.literal("success"),
    address: z.string(),
    txn: z.any(),
    id: z.string(),
});

export function Review({
    nextStep,
    isSending,
    setIsSending
}: {
    nextStep: NextStep,
    isSending: boolean,
    setIsSending: (sending: boolean) => void
}) {
    const { getRoutes, routes: _route, tempAccount, setTransaction } = useRouteStore();

    const routes = getRoutes()

    const gasFees = routes.map((route) => Number(route.gasCostUSD)).reduce((a, b) => a + b, 0);
    const feeCosts = routes.map((route) => route.steps.map((step) => step.estimate?.feeCosts?.map((fee) => Number(fee.amountUSD))?.reduce((a, b) => a + b, 0) ?? 0).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
    let duration = routes.map((route) => route.steps.map((step) => step.estimate?.executionDuration ?? 0).reduce((a, b) => a + b, 0)).reduce((a, b) => Math.max(a, b), 0); // Steps are executed in parallel, so we take the max
    if (duration > 0) {
        duration += 3 * 60; // Add 3 min for the transaction to be mined
    }
    const steps = routes.map((route) => route.steps.length).reduce((a, b) => a + b, 0);
    const sum = routes.reduce((acc, route) => acc + BigInt(route.toAmount), BigInt(0));
    const slippage = routes.map((route) => route.steps.map((step) => step.action.slippage ?? 0).reduce((a, b) => Math.max(a, b), 0)).reduce((a, b) => Math.max(a, b), 0);
    const amountMin = routes.map((route) => BigInt(route.toAmountMin)).reduce((a, b) => a + b, 0n);

    const { data: walletClient } = useWalletClient()
    const { data } = useFeeData();
    const account = useAccount();
    const { chain } = useNetwork();
    const router = useRouter();

    const sendTxn = async () => {
        setIsSending(true);

        const body: any = {
            from: account.address,
            account: tempAccount,
            chainId: chain?.id,
            routes,
        };

        if (typeof data?.maxFeePerGas === "bigint") {
            body.maxFeePerGas = data?.maxFeePerGas;
        }

        if (typeof data?.maxPriorityFeePerGas === "bigint") {
            body.maxPriorityFeePerGas = data?.maxPriorityFeePerGas;
        }

        const _res = fetch("/api/initiate", {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(async (res) => {
            const body = await res.json();
            if (!res.ok) {
                throw new Error(body?.error ?? "Unknown error");
            }
            return body
        })


        const res = await new Promise((resolve, reject) => {
            toast.promise(_res, {
                loading: 'Loading the transaction data...',
                success: (data) => {
                    resolve(data);
                    return `Transaction data loaded`;
                },
                error: (e) => {
                    reject(e);
                    setIsSending(false);
                    return <>
                        <b>Could not load transaction data</b>
                        {e instanceof Error && e.message.split("\n")[0]}
                    </>
                }
            });
        })

        const { address, txn } = await InitiateResponse.parseAsync(res);

        // Sending tx
        let _hash: `0x${string}` | undefined;
        let counter = 0;
        do {
            counter++;

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
                        setIsSending(false);
                        return <>
                            <b>Could not send transaction... trying again</b>
                            {e instanceof Error && e.message}
                        </>
                    }
                });
            })

            setTransaction({
                routes,
                timestamp: Date.now(),
                id: address,
                status: 0,
            })

            console.log(`Transaction sent: ${_hash}`);

            const notifyBackend = await fetch("/api/receive-funds", {
                method: "POST",
                body: JSON.stringify({
                    chainId: chain?.id,
                    transactionHash: _hash,
                    accountAddress: tempAccount
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            }).then((res) => res.json());

            console.log(`Backend notified: ${notifyBackend.status}`)

            if ((notifyBackend as any).status === "success") {
                nextStep(_hash);
                break;
            }
        } while (!_hash && counter < 3);

        if (!_hash) {
            toast.error("Could not send transaction")
            setIsSending(false);
            return;
        }
    }

    return <div>
        <div className="text-center pb-4">
            <ArrowLeftRight className="inline w-8 h-8" />
            <div className="font-bold text-2xl mt-2 mb-4">Review Trade</div>
        </div>
        <div className="flex flex-row justify-evenly items-center max-w-xs mx-auto">
            <div className="flex flex-col gap-2">
                {routes.map((route) => <Tooltip>
                    <TooltipTrigger>
                        <img src={route.fromToken.logoURI} alt={route.fromToken.symbol} className="w-6 h-6 rounded-full" />
                    </TooltipTrigger>
                    <TooltipContent>
                        {formatUnits(BigInt(route.fromAmount), route.fromToken.decimals)} {route.fromToken.symbol}
                    </TooltipContent>
                </Tooltip>)}
            </div>
            <Funnel height={routes.length * 3} />
            <Tooltip>
                <TooltipTrigger>
                    <img src={routes[0]?.toToken.logoURI} alt={routes[0]?.toToken.symbol} className="w-6 h-6 rounded-full" />
                </TooltipTrigger>
                <TooltipContent>
                    {formatUnits(sum, routes[0]?.toToken.decimals)} {routes[0]?.toToken.symbol}
                </TooltipContent>
            </Tooltip>
        </div>
        <div className="grid grid-cols-2 gap-2 my-4">
            <p><Receipt className="inline w-4 h-4 mr-1" />Minimum Output</p>
            <p className="text-right">
                {format(formatUnits(amountMin, routes[0].toToken.decimals))} {routes[0].toToken.symbol}
            </p>
            <p><PercentCircle className="inline w-4 h-4 mr-1" />Slippage</p>
            <p className="text-right">
                {Math.round(slippage * 1000) / 10}%
            </p>
            <p><DollarSign className="inline w-4 h-4 mr-1" /> Fees</p>
            <p className="text-right">
                {format(feeCosts)}$
            </p>
            <p><Fuel className="inline w-4 h-4 mr-1" /> Gas Fees</p>
            <p className="text-right">
                {format(gasFees)}$
            </p>
            <p><Layers2 className="inline w-4 h-4 mr-1" /> Steps</p>
            <p className="text-right">
                {steps}
            </p>
        </div>
        <div className="flex gap-2">
            <Button className="w-full" disabled={isSending} onClick={sendTxn}>
                {isSending && <Loader2 className="h-6 w-6 animate-spin mx-2" />}
                Confirm Swap
            </Button>
        </div>
    </div>
}