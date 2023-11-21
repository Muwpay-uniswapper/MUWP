"use client";

import { useBreakpoint } from "@/lib/front/media-query";
import { useState, useEffect } from "react";
import { cn } from "@/lib/front/utils";

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAboveMd } = useBreakpoint("md");

    useEffect(() => {
        if (isAboveMd) {
            setIsMenuOpen(false);
        }
    }, [isAboveMd]);

    return (
        <div className={cn("text-white my-auto py-4 items-center relative w-full top-0 z-50 transition-all",
            isMenuOpen ? "backdrop-blur-sm bg-black/50" : "bg-transparent")}>
            <div className="container max-w-screen-xl flex justify-between">
                <div className="flex flex-row justify-between w-full">
                    <a href="/" className="flex items-center gap-x-2 cursor-pointer">
                        <img src="/muwpayLogoIcon.svg" alt="logo" />
                        <p>BETA</p>
                    </a>
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
                        <a className="" href="/bot">
                            <button disabled className="uppercase py-2 px-4 rounded-sm text-white hover:bg-gradient-to-r hover:from-[#DC7896] hover:to-[#9E59FE] hover:text-transparent bg-clip-text transition-all duration-300 ease-in-out false !cursor-default">
                                BOT
                            </button>
                        </a>
                        <a className="" href="/transactions">
                            <button className="uppercase cursor-pointer py-2 px-4 rounded-sm text-white hover:bg-gradient-to-r hover:from-[#DC7896] hover:to-[#9E59FE] hover:text-transparent bg-clip-text transition-all duration-300 ease-in-out false false">
                                transactions
                            </button>
                        </a>
                        <a className="" href="/networks">
                            <button disabled className="uppercase py-2 px-4 rounded-sm text-white hover:bg-gradient-to-r hover:from-[#DC7896] hover:to-[#9E59FE] hover:text-transparent bg-clip-text transition-all duration-300 ease-in-out false !cursor-default">
                                Networks
                            </button>
                        </a>
                        <a className="" href="/blockchain">
                            <button disabled className="uppercase py-2 px-4 rounded-sm text-white hover:bg-gradient-to-r hover:from-[#DC7896] hover:to-[#9E59FE] hover:text-transparent bg-clip-text transition-all duration-300 ease-in-out false !cursor-default">
                                Blockchain
                            </button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
