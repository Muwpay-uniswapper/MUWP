"use client";

import React from 'react'
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
import { FormatTokenAddress } from '../tokens/token_input';
import { useAccount } from 'wagmi';

const AllocationWallet: React.FC = () => {
    const { getRoutes, routes: _route, multiWallets, multiWalletDistribution } = useRouteStore();
    const { chain } = useAccount();
    const distribution = multiWalletDistribution;

    const routes = getRoutes();
    const inputTokens = routes.map(route => ({ token: route.fromToken, fromAmount: route.fromAmount }));

    const maps = (wallet: string, i: number, validate: (newAmount: number, i: number) => void, inputValue: string, setInputValue: (str: string) => void) => <>
        <FormatTokenAddress address={wallet} chainId={chain?.id ?? 1} />
        <input
            className="text-sm font-semibold bg-transparent border-none focus:ring-0 focus:outline-none text-white w-12 text-right"
            value={inputValue}
            placeholder="0"
            onChange={e => {
                const newAmount = parseInt(e.target.value == "" ? "0" : e.target.value);
                if (isNaN(newAmount) || newAmount > 100 || newAmount < 0) return;
                setInputValue(newAmount.toString());
            }}
            onKeyDown={e => {
                if (e.key !== 'Enter') return;
                const newAmount = parseInt(inputValue);
                validate(newAmount, i);
            }}
            onBlur={e => {
                const newAmount = parseInt(e.target.value == "" ? "0" : e.target.value);
                if (isNaN(newAmount) || newAmount > 100 || newAmount < 0) return;
                setInputValue(newAmount.toString());
                validate(newAmount, i);
            }}
            type="text"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
        />
        %
    </>


    return <>
        {inputTokens.map(({ token, fromAmount }) => (<>
            <div className="flex flex-row items-center gap-3 my-4">
                <img src={token?.logoURI} className="h-6 w-6" />
                {(Object.keys(distribution[token.address])?.length ?? 0) < 4 ?
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
                        // @ts-expect-error React doesn't allow generic components
                        maps={maps}
                    />
                    : <Dialog>
                        <DialogTrigger asChild>
                            <Button className='w-full'>
                                View {token.symbol} Allocation <ArrowRightIcon className='w-4 h-4 ml-2' />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className='max-w-3xl'>
                            <DialogHeader>
                                <DialogTitle><img src={token?.logoURI} className="h-6 w-6 inline" /> Allocation</DialogTitle>
                                <DialogDescription>
                                    Adjust the allocation of {token.symbol} to different wallets
                                </DialogDescription>
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
                                    // @ts-expect-error React doesn't allow generic components
                                    maps={maps}
                                />
                            </DialogHeader>
                        </DialogContent>
                    </Dialog>}
            </div>
        </>))}
    </>
}

export default AllocationWallet;
