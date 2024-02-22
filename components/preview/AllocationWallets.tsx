"use client";

import React, { useEffect } from 'react'
import { Slider } from '../ui/slider';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowRightIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { useRouteStore } from '@/lib/core/data/routeStore';

const AllocationWallet: React.FC = () => {
    const { getRoutes, routes: _route, multiWallets, multiWalletDistribution } = useRouteStore();
    const distribution = multiWalletDistribution;

    const routes = getRoutes();
    const inputTokens = routes.map(route => ({ token: route.fromToken, fromAmount: route.fromAmount }));

    useEffect(() => {
        const _distribution = { ...multiWalletDistribution };
        for (const { token, fromAmount } of inputTokens) {
            // Distribute the tokens evenly. The bigint represents the token amount, not the percentage
            const amount = BigInt(fromAmount);
            const wallets = multiWallets ?? [];
            if (!_distribution[token.address] || Object.keys(_distribution[token.address]).length !== wallets.length || !wallets.every(wallet => Object.keys(_distribution[token.address]).includes(wallet))) {
                _distribution[token.address] = {};
                for (const wallet of wallets) {
                    _distribution[token.address][wallet] = amount / BigInt(wallets.length);
                }
            }
        }
        useRouteStore.setState({ multiWalletDistribution: _distribution });
    }, [inputTokens.map((token) => token.token.address).join(","), multiWallets?.join(",")]);


    return <>
        <code>{JSON.stringify(distribution, null, 2)}</code>
        {inputTokens.map(({ token, fromAmount }) => (<>
            <code>{JSON.stringify(Object.values(distribution[token.address] ?? {}).map((value) => Number(100n * value / BigInt(fromAmount))).reduce((acc, val, i) => { acc.push(i === 0 ? val : acc[i - 1] + val); return acc; }, [] as number[]))}</code>
            <div className="flex flex-row items-center gap-3 my-4">
                <img src={token.logoURI} className="h-6 w-6" />
                {(multiWallets?.length ?? 1) - 1}
                {(distribution[token.address]?.length ?? 0) < 4 ?
                    <Slider
                        className="h-8"
                        colors={multiWallets?.map((token) => "#fff") ?? ["#fff"]}
                        value={Object.values(distribution[token.address] ?? {}).map((value) => Number(100n * value / BigInt(fromAmount))).reduce((acc, val, i) => { acc.push(i === 0 ? val : acc[i - 1] + val); return acc; }, [] as number[]).slice(0, -1)}
                        onValueChange={(value) => {
                            const keys = Object.keys(distribution[token.address] ?? {});
                            const _distribution = { ...distribution };
                            for (let i = 0; i < keys.length; i++) {
                                const previousValue = i > 0 ? value[i - 1] : 0;
                                let diff = (value[i] ?? 100) - previousValue;
                                diff = (diff < 0 || isNaN(diff)) ? 0 : diff;
                                _distribution[token.address][keys[i]] = (BigInt(fromAmount) * BigInt(diff)) / 100n;
                            }
                            useRouteStore.setState({ multiWalletDistribution: _distribution });
                        }}
                        max={100}
                        step={1}
                        thumbs={(multiWallets?.length ?? 1) - 1}
                        minStepsBetweenThumbs={1}
                        objects={multiWallets}
                        maps={(wallet, i, validate, inputValue, setInputValue) => {
                            return wallet as string
                        }}
                    />
                    : <Dialog>
                        <DialogTrigger>
                            <Button className='w-full'>
                                View Allocation <ArrowRightIcon className='w-4 h-4 ml-2' />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-3xl'>
                            <DialogHeader>
                                <DialogTitle>Allocation</DialogTitle>
                                <DialogDescription>
                                    Adjust the allocation of the output tokens
                                </DialogDescription>

                            </DialogHeader>
                        </DialogContent>
                    </Dialog>}
            </div>
        </>))}
    </>
}

export default AllocationWallet;
