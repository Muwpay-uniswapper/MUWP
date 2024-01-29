"use client";

import React, { useState, useEffect } from 'react'
import { Slider } from '../ui/slider';
import { useSwapStore } from '@/lib/front/data/swapStore';
import { getColors } from './colour';

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
        <Slider
            className="h-8"
            colors={outputTokens.map((token) => colors[token.address] ?? "#fff")}
            value={outputDistribution}
            onValueChange={setDistribution}
            max={100}
            step={1}
            thumbs={outputDistribution.length}
            minStepsBetweenThumbs={1}
        />
    </>
}

export default Allocation;
