import React, { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

export function Progress({ validUntil }: { validUntil: Date; }) {
    const [progress, setProgress] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<string>('');

    const totalDuration = validUntil.getTime() - new Date().getTime();

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const distance = validUntil.getTime() - now.getTime();
            if (distance <= 0) clearInterval(interval);
            const progress = Math.max(0, (distance / totalDuration) * 100);
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes}m ${seconds}s`);
            setProgress(progress);
        }, 1000);

        return () => clearInterval(interval);
    }, [validUntil]);

    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const progressOffset = ((100 - progress) / 100) * circumference;

    return <Tooltip>
        <TooltipTrigger className='flex flex-row items-center gap-1'>
            {totalDuration > 0 && <span className='tabular-nums'>{timeLeft}</span>}
            <svg
                viewBox="0 0 100 100"
                className="w-8 h-8"
                style={{ transform: 'rotate(-90deg)' }}
            >
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="#fff"
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                />
            </svg>
        </TooltipTrigger>
        <TooltipContent>
            You have {timeLeft} to complete the swap, otherwise a new rate will be calculated.
        </TooltipContent>
    </Tooltip>
}