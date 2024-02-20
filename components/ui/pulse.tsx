import { useState, FC, useEffect } from 'react'
import { create } from 'zustand';

// Define your store
type PulseState = {
    pulse: boolean;
    triggerPulse: () => void;
};

export const usePulseStore = create<PulseState>((set) => ({
    pulse: false,
    triggerPulse: () => {
        set({ pulse: true })
        setTimeout(() => set({ pulse: false }), 500); // Match pulse animation duration
    },
}));

// The Status component
export const Status: FC<{ connected: boolean, auto: boolean }> = ({ connected, auto }) => {
    const pulse = usePulseStore(state => state.pulse);
    const pulseClass = pulse ? 'animate-pulse' : ''

    const [autoPulse, setAutoPulse] = useState(auto);
    useEffect(() => {
        if (autoPulse) {
            const interval = setInterval(() => {
                usePulseStore.getState().triggerPulse();
            }, 1000);
            setAutoPulse(false);
            return () => clearInterval(interval);
        }
    }, [autoPulse]);

    return (
        <span className={`${connected ? 'text-green-500' : 'text-red-500'} ${pulseClass}`}>
            •
        </span>
    );
};