import { erc20ABI, useAccount, useNetwork, usePublicClient, useWalletClient } from "wagmi";
import { useRouteStore } from "@/lib/front/data/routeStore";
import { Loader2, Unlock } from "lucide-react";
import React, { useState } from "react";
import { formatUnits, getContract, zeroAddress } from "viem";
import { toast } from "sonner";
import { MUWPChain } from "@/muwp";
import { Button } from "../ui/button";
import { NextStep } from "./process";
export function Approvals({
    nextStep
}: {
    nextStep: NextStep
}) {
    const { getRoutes, routes: _route } = useRouteStore();
    const { data: walletClient } = useWalletClient()
    const publicClient = usePublicClient()
    const account = useAccount();
    const { chain } = useNetwork();

    const [isWaiting, setWaiting] = useState(-1);

    const [index, setIndex] = useState(0);

    const routes = React.useMemo(() => getRoutes().filter(route => route.fromToken.address !== zeroAddress), [_route])

    const approve = async (unlimited: boolean) => {
        setWaiting(unlimited ? 1 : 0);

        const allowance = async () => {
            // Check allowance
            const contract = getContract({
                address: routes[index].fromToken.address as `0x${string}`,
                abi: erc20ABI,
                publicClient: publicClient!,
                walletClient: walletClient!,
            })

            const allowance = await contract.read.allowance([account.address!, (chain as MUWPChain).muwpContract]) // TODO: Replace with router address

            const amount = unlimited ? (2n ** 256n - 1n) : BigInt(routes[index].steps[0].action.fromAmount)

            if (allowance < amount) {
                const hash = await contract.write.approve([(chain as MUWPChain).muwpContract, amount])

                await publicClient.waitForTransactionReceipt({ hash })
            }
        }
        await new Promise((resolve, reject) => {
            toast.promise(allowance, {
                loading: `Waiting for approvals on ${routes[index].fromToken.symbol}...`,
                success: (data) => {
                    setWaiting(-1);
                    resolve(data);
                    if (index == routes.length - 1) {
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
        <div className="text-gray-500 text-sm pb-4 text-center">{index} of {routes.length}</div>
        <div className="text-center pb-4">
            <Unlock className="inline w-8 h-8" />
            <div className="font-bold text-2xl mt-2 mb-4">Unlock {routes[index].fromToken.symbol}</div>
            We need your approval to move <span className="font-bold">{formatUnits(BigInt(routes[index].fromAmount), routes[index].fromToken.decimals)} {routes[index].fromToken.symbol}</span> on your behalf
        </div>
        <div className="flex gap-2">
            <Button className="w-full" onClick={() => approve(false)} disabled={isWaiting != -1}>
                {isWaiting == 0 && <Loader2 className="h-6 w-6 animate-spin mx-2" />}
                Unlock {routes[index].fromToken.symbol}
            </Button>
            <Button className="w-full" onClick={() => approve(true)} disabled={isWaiting != -1}>
                {isWaiting == 1 && <Loader2 className="h-6 w-6 animate-spin mx-2" />}
                Unlock {routes[index].fromToken.symbol} Permanently
            </Button>
        </div>
    </div>
}