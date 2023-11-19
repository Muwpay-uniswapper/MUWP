import { useEffect, useState } from 'react'

function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(true)

    useEffect(() => {
        const matchMedia = window.matchMedia(query)

        function handleChange() {
            setMatches(matchMedia.matches)
        }

        // Triggered at the first client-side load and if query changes
        setMatches(matchMedia.matches)

        // Listen matchMedia
        if (matchMedia.addListener) {
            matchMedia.addListener(handleChange)
        } else {
            matchMedia.addEventListener('change', handleChange)
        }

        return () => {
            if (matchMedia.removeListener) {
                matchMedia.removeListener(handleChange)
            } else {
                matchMedia.removeEventListener('change', handleChange)
            }
        }
    }, [query])

    return matches
}

import resolveConfig from "tailwindcss/resolveConfig";
import { Config, ScreensConfig } from "tailwindcss/types/config";

import tailwindConfig from "@/tailwind.config"; // Your tailwind config

const fullConfig = resolveConfig(tailwindConfig as unknown as Config);

const breakpoints = fullConfig?.theme?.screens || {
    xs: "480px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
};

export function useBreakpoint<K extends string>(breakpointKey: K) {
    const breakpointValue = breakpoints[breakpointKey as keyof ScreensConfig];
    const bool = useMediaQuery(`(max-width: ${breakpointValue})`);
    const capitalizedKey = breakpointKey[0].toUpperCase() + breakpointKey.substring(1);

    type KeyAbove = `isAbove${Capitalize<K>}`;
    type KeyBelow = `isBelow${Capitalize<K>}`;

    return {
        [breakpointKey]: Number(String(breakpointValue).replace(/[^0-9]/g, "")),
        [`isAbove${capitalizedKey}`]: !bool,
        [`isBelow${capitalizedKey}`]: bool,
    } as Record<K, number> & Record<KeyAbove | KeyBelow, boolean>;
}