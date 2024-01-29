"use client";

import React, { useState, useEffect, useRef } from 'react'
import { Slider } from '../ui/slider';
import { useSwapStore } from '@/lib/front/data/swapStore';

const Allocation: React.FC = () => {
    const { outputTokens } = useSwapStore()
    const [value, setValue] = useState([33, 66]);

    useEffect(() => {
        const array = Array.from(Array(outputTokens.length - 1).keys()).map((_, i) => Math.round(100 / outputTokens.length * (i + 1)))
        setValue(array);
        console.log(array)
    }, [outputTokens.length])

    return <>
        <Slider
            className="h-8"
            value={value}
            onValueChange={setValue}
            max={100}
            step={1}
            thumbs={value.length}
            minStepsBetweenThumbs={1}
        />
    </>
}

export default Allocation;
