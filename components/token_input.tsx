import React from "react";
import { Token } from "@/lib/front/model/Token"

export function TokenInput({
    token
}: {
    token: Token
}) {
    const [amount, setAmount] = React.useState(0)
    return <div className="w-full bg-white dark:bg-zinc-800">
        <div className="flex flex-wrap items-center justify-between bg-blue-50 dark:bg-blue-800 p-4 rounded">
            <div className="flex flex-col  items-start w-9/12">
                <div className="flex items-center space-x-2">
                    <img
                        alt="Token Symbol"
                        height="32"
                        src={token.logoURI}
                        style={{
                            aspectRatio: "32/32",
                            objectFit: "cover",
                        }}
                        width="32"
                    />
                    <input
                        aria-label="Token amount"
                        className="text-2xl font-semibold bg-transparent border-none focus:ring-0 focus:outline-none"
                        value={amount}
                        onChange={(e) => {
                            let n = Number(e.target.value)
                            if (isNaN(n)) n = 0
                            setAmount(n)
                        }}
                        type="text"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
            <div className="text-xl font-semibold text-blue-700 dark:text-blue-300 text-right">{token.label}</div>
            <div className="text-sm font-normal text-gray-500 w-full text-left">≈{token.priceUSD * amount} $</div>
        </div>

        <div className="text-left p-4">
            <div className="text-base font-semibold">{token.label} Token</div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400">{token.address}</div>
        </div>
    </div>
}