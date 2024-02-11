"use client";

import React, { useState, useEffect } from 'react'
import { Slider } from '../ui/slider';
import { useSwapStore } from '@/lib/core/data/swapStore';
import { getColors } from './colour';
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

const Allocation: React.FC = () => {
    const { outputTokens, outputDistribution, setDistribution } = useSwapStore();

    const [colors, setColors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        (async () => {
            const cls = await getColors(outputTokens);
            setColors(cls);
        })();
    }, [outputTokens.map((token) => token.logoURI).join()]);

    useEffect(() => {
        const array = Array.from(Array(outputTokens.length - 1).keys()).map((_, i) => Math.round(100 / outputTokens.length * (i + 1)))
        setDistribution(array);
    }, [outputTokens.length]);

    return <>
        {outputDistribution.length < 4 ?
            <Slider
                className="h-8"
                colors={outputTokens.map((token) => colors[token.address] ?? "#fff")}
                tokens={outputTokens}
                value={outputDistribution}
                onValueChange={setDistribution}
                max={100}
                step={1}
                thumbs={outputDistribution.length}
                minStepsBetweenThumbs={1}
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
                        <Slider
                            className="h-8"
                            colors={outputTokens.map((token) => colors[token.address] ?? "#fff")}
                            tokens={outputTokens}
                            value={outputDistribution}
                            onValueChange={setDistribution}
                            max={100}
                            step={1}
                            thumbs={outputDistribution.length}
                            minStepsBetweenThumbs={1}
                        />
                    </DialogHeader>
                </DialogContent>
            </Dialog>}
    </>
}

export default Allocation;
