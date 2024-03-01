"use client";

import { useBreakpoint } from "@/lib/core/media-query";
import { useState, useEffect } from "react";
import { cn } from "@/lib/core/utils";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useSwapStore } from "@/lib/core/data/swapStore";
import { ArrowLeft, Home } from "lucide-react";
import { usePathname } from "next/navigation";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAboveMd } = useBreakpoint("md");
    const { chain } = useAccount();
    const { outputChain } = useSwapStore();
    const path = usePathname();

    const [homeURL, setHomeURL] = useState("/");

    useEffect(() => {
        if (isAboveMd) {
            setIsMenuOpen(false);
        }
    }, [isAboveMd]);

    useEffect(() => {
        const newParams = new URLSearchParams(window.location.search);
        if (chain) newParams.set('chain', chain.id.toString());
        if (outputChain) newParams.set('toChain', outputChain.toString());
        setHomeURL(`/?${newParams.toString()}`);
    }, [chain, outputChain]);

    return (
        <div className={cn("text-white my-auto py-4 items-center relative w-full top-0 z-50 transition-all",
            isMenuOpen ? "backdrop-blur-sm bg-black/50" : "bg-transparent")}>
            <div className="container max-w-screen-xl flex justify-between">
                <div className="flex flex-row justify-between w-full">
                    <Link href={homeURL} className="flex items-center gap-x-2 cursor-pointer">
                        <img src="/muwpayLogoIcon.svg" alt="logo" />
                        <p>BETA</p>
                    </Link>
                    <button className="flex flex-col justify-center items-center gap-1 w-8 h-8 md:hidden"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <div className={`w-5 h-0.5 bg-white transition-all ${isMenuOpen ? "transform rotate-45 translate-y-[6px]" : ""}`}></div>
                        <div className={`w-5 h-0.5 bg-white transition-all ${isMenuOpen ? "opacity-0" : ""}`}></div>
                        <div className={`w-5 h-0.5 bg-white transition-all ${isMenuOpen ? "transform -rotate-45 -translate-y-[6px]" : ""}`}></div>
                    </button>
                </div>
                <div className={`transition-all flex flex-col md:flex-row items-center gap-8 absolute z-0 left-0 top-0 mt-[80px] py-6 w-full md:relative md:mt-0 md:py-0 md:w-fit text-white
                ${isMenuOpen ? "translate-y-0 backdrop-blur-sm bg-black/50 opacity-100" : "-translate-y-[calc(100%+70px)] md:translate-y-0 opacity-0 md:opacity-100"}`
                }>
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        {path !== "/" && <Link className="" href={homeURL}>
                            <button className="uppercase cursor-pointer py-2 px-4 rounded-sm text-white hover:bg-gradient-to-r hover:from-[#DC7896] hover:to-[#9E59FE] hover:text-transparent bg-clip-text transition-all duration-300 ease-in-out false false">
                                HOME
                            </button>
                        </Link>}
                        <Link className="" href="/transactions">
                            <button className="uppercase cursor-pointer py-2 px-4 rounded-sm text-white hover:bg-gradient-to-r hover:from-[#DC7896] hover:to-[#9E59FE] hover:text-transparent bg-clip-text transition-all duration-300 ease-in-out false false">
                                transactions
                            </button>
                        </Link>
                        <Link className="uppercase py-2 px-4 rounded-sm text-white hover:bg-gradient-to-r hover:from-[#DC7896] hover:to-[#9E59FE] hover:text-transparent bg-clip-text transition-all duration-300 ease-in-out false" href="/networks">
                            Networks
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
