"use client";

import { useAccount, useWalletClient } from "wagmi";
import { useRouteStore } from "@/lib/core/data/routeStore";
import { Loader2, Unlock } from "lucide-react";
import React, { useState } from "react";
import { erc20Abi, formatUnits, getContract, publicActions, zeroAddress } from "viem";
import { toast } from "sonner";
import { MUWPChain } from "@/muwp";
import { Button } from "../ui/button";
import { NextStep } from "./process";
import { Token } from "@/lib/li.fi-ts";

export function Approvals({
    nextStep
}: {
    nextStep: NextStep
}) {
    const { getRoutes, routes: _route } = useRouteStore();
    const { data: walletClient } = useWalletClient()
    const { chain, address } = useAccount();

    const [isWaiting, setWaiting] = useState(-1);

    const [index, setIndex] = useState(0);

    const routes = React.useMemo(() => getRoutes().filter(route => route.fromToken.address !== zeroAddress), [_route])
    const toApprove = React.useMemo(() => {
        const pending: {
            [key: string]: { amount: bigint, token: Token }
        } = {}

        for (const route of routes) {
            pending[route.fromToken.address] = {
                amount: BigInt(route.fromAmount) + (pending[route.fromToken.address]?.amount ?? 0n),
                token: route.fromToken
            }
        }

        return Object.entries(pending).map(([address, obj]) => ({ address: address as `0x${string}`, amount: obj.amount, token: obj.token }))
    }, [routes])


    const approve = async (unlimited: boolean) => {
        setWaiting(unlimited ? 1 : 0);

        const allowance = async () => {
            if (typeof walletClient === 'undefined') return;
            const client = walletClient.extend(publicActions);
            // Check allowance
            const contract = getContract({
                address: toApprove[index].address,
                abi: erc20Abi,
                client,
            })

            const allowance = await contract.read.allowance([address!, (chain as MUWPChain).muwpContract]) // TODO: Replace with router address

            const amount = unlimited ? (2n ** 256n - 1n) : toApprove[index].amount

            if (allowance < amount) {
                const hash = await contract.write.approve([(chain as MUWPChain).muwpContract, amount])

                await client.waitForTransactionReceipt({ hash })
            }
        }
        await new Promise((resolve, reject) => {
            toast.promise(allowance, {
                loading: `Waiting for approvals on ${routes[index].fromToken.symbol}...`,
                success: (data) => {
                    setWaiting(-1);
                    resolve(data);
                    if (index == toApprove.length - 1) {
                        nextStep()
                    } else {
                        setIndex(index + 1);
                    }
                    return `Approvals successful`;
                },
                error: (e) => {
                    setWaiting(-1);
                    reject(e);
                    return <>
                        <b>Could not approve tokens</b>
                        {e instanceof Error && e.message}
                    </>
                },
            });
        })
    }

    return <div>
        <div className="text-gray-500 text-sm pb-4 text-center">{index} of {toApprove.length}</div>
        <div className="text-center pb-4">
            <Unlock className="inline w-8 h-8" />
            <div className="font-bold text-2xl mt-2 mb-4">Unlock {toApprove[index].token.symbol}</div>
            We need your approval to move <span className="font-bold">{formatUnits(toApprove[index].amount, toApprove[index].token.decimals)} {toApprove[index].token.symbol}</span> on your behalf
        </div>
        <div className="flex gap-2">
            <Button className="w-full" onClick={() => approve(false)} disabled={isWaiting != -1}>
                {isWaiting == 0 && <Loader2 className="h-6 w-6 animate-spin mx-2" />}
                Unlock {toApprove[index].token.symbol}
            </Button>
            <Button className="w-full" onClick={() => approve(true)} disabled={isWaiting != -1}>
                {isWaiting == 1 && <Loader2 className="h-6 w-6 animate-spin mx-2" />}
                Unlock {toApprove[index].token.symbol} Permanently
            </Button>
        </div>
    </div>
}