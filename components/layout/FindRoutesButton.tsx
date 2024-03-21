"use client";

import { useSwapStore } from "@/lib/core/data/swapStore";
import { Button } from "../ui/button";
import { useAccount } from "wagmi";
import { useRouteStore } from "@/lib/core/data/routeStore";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import React, { useState } from "react";
import { zeroAddress } from "viem";



export function FindRoutesButton() {
    const { inputTokens, outputTokens, inputAmount, outputChain, allowDenyBridges, allowDenyExchanges, outputDistribution, targetAddress } = useSwapStore();
    const { fetchRoutes, isFetching, tempAccount, validUntil, multiWalletDistribution, multiWallets, getRoutes, gasPayer } = useRouteStore();
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

    React.useEffect(() => {
        if (address) {
            useRouteStore.setState({ multiWallets: [address], gasPayer: address });
        }
    }, [address, typeof multiWallets == "undefined"]);

    const _distribution = { ...multiWalletDistribution };

    const fixDistribution = () => {
        const routes = getRoutes();
        const inputTokens = routes.map(route => ({ token: route.fromToken, fromAmount: route.fromAmount }));
        const total = inputTokens.reduce((acc, { fromAmount }) => acc + BigInt(fromAmount), 0n);

        for (const { token, fromAmount } of inputTokens) {
            // Distribute the tokens evenly. The bigint represents the token amount, not the percentage
            const amount = BigInt(fromAmount);
            const wallets = multiWallets ?? [address!];
            if (!_distribution[token.address]
                || Object.keys(_distribution[token.address]).length !== wallets.length
                || !wallets.every(wallet => Object.keys(_distribution[token.address]).includes(wallet))
                || total !== Object.values(_distribution[token.address]).reduce((acc, val) => acc + val, 0n)
            ) {
                _distribution[token.address] = {};
                if (token.address === zeroAddress) {
                    _distribution[token.address][gasPayer ?? address!] = amount;
                } else {
                    let leftToSpend = amount;
                    wallets.forEach((wallet, index) => {
                        if (index === wallets.length - 1) {
                            _distribution[token.address][wallet] = leftToSpend;
                        } else {
                            const share = amount / BigInt(wallets.length);
                            _distribution[token.address][wallet] = share;
                            leftToSpend -= share;
                        }
                    });
                }
            }
        }
        useRouteStore.setState({ multiWalletDistribution: _distribution });

        console.log(_distribution, multiWallets);
    }

    React.useEffect(fixDistribution, [address, multiWallets?.join(","), getRoutes()[0]?.id]);

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
            });

            console.log("Routes fetched");

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