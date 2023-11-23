import React from "react";
import { Token } from "@/lib/front/model/CellLike"
import { useSwapStore } from "@/lib/front/data/swapStore";
import { formatUnits, parseUnits } from "viem";

export function TokenInput({
    token,
    mode
}: {
    token: Token,
    mode: "input" | "output"
}) {
    const { inputAmount, setAmount, priceOutput } = useSwapStore()
    const [inputValue, setInputValue] = React.useState('');
    const _value = mode == "input" ? inputAmount[token.value] ?? 0n : priceOutput().amount;
    const value = formatUnits(_value, token.decimals);

    React.useEffect(() => {
        setInputValue(value);
    }, [value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value;
        setInputValue(rawValue);

        if (!isNaN(parseFloat(rawValue)) && isFinite(+rawValue)) {
            const newAmount = parseUnits(rawValue, token.decimals);
            setAmount(token, newAmount);
        }
    }

    // format the number when unfocusing
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setInputValue(value)
    }

    return <div className="w-full bg-zinc-800">
        <div className="flex flex-wrap items-center justify-between bg-blue-50 dark:bg-blue-800 p-4 rounded">
            <div className="flex flex-col  items-start w-full">
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
                        className="text-2xl font-semibold bg-transparent border-none focus:ring-0 focus:outline-none text-black"
                        value={inputValue}
                        disabled={mode == 'output'}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        type="text"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
            <div className="text-xl font-semibold text-blue-500 text-right">{token.label}</div>
            <div className="text-sm font-normal text-gray-500 w-full text-left">≈{formatUnits((parseUnits(token.priceUSD?.toString() ?? "", 9) * _value), 9 + token.decimals)} $</div>
        </div>

        <div className="text-left p-4">
            <div className="text-base font-semibold">{token.label} Token</div>
            <div className="text-sm text-zinc-400">{token.address}</div>
        </div>
    </div>
}