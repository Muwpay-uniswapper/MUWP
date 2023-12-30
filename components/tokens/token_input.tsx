import React from "react";
import { Token } from "@/lib/front/model/CellLike"
import { useSwapStore } from "@/lib/front/data/swapStore";
import { Chain, formatUnits, parseUnits, zeroAddress } from "viem";
import { Badge } from "../ui/badge";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { BadgeCheck, FileDigit, Wallet2Icon } from "lucide-react";
import { publicClient } from "@/app/providers";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/front/utils";

export function FormatTokenAddress({ token }: { token: Token }) {
    const { chain } = publicClient({ chainId: token.chainId })

    if (token.address === zeroAddress) return <div className="text-sm text-zinc-400 flex flex-row items-center gap-1"><BadgeCheck className="inline w-4 h-4" /> Native Token</div>

    const shortAddress = `${token.address.slice(0, 6)}...${token.address.slice(-4)}`
    return <div className="text-sm text-zinc-400 flex flex-row items-center gap-1">
        <FileDigit className="inline w-4 h-4" />
        <a href={`${chain?.blockExplorers?.default.url}/address/${token.address}`} target="_blank" rel="noreferrer" className="hover:underline font-mono">{shortAddress}</a>
    </div>
}

export function PercentageSelector({
    token,
    balance
}: {
    token: Token,
    balance: bigint
}) {
    const [inputValue, setInputValue] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    const { inputAmount, setAmount, priceOutput } = useSwapStore()

    return <Tooltip onOpenChange={() => {
        setInputValue('');
        setTimeout(() => {
            inputRef.current?.focus();
        }, 100);
    }}>
        <TooltipTrigger>
            <Badge
                className={cn("text-sm",
                    inputAmount[token.value] > balance
                        ? "text-red-500 border-red-500"
                        : "text-white"
                )}
                variant="outline"
                onClick={e => {
                    e.stopPropagation();
                }}
            >{
                    Math.round((Number(BigInt(inputAmount[token.value] ?? 0n) * 1000n / BigInt(balance))) / 10).toString() + "%"
                }</Badge>
        </TooltipTrigger>
        <TooltipContent>
            <div className="flex flex-row gap-2">
                <Badge className="text-sm" variant="outline" onClick={e => {
                    e.stopPropagation();
                    setAmount(token, balance / 4n)
                }}>
                    25%
                </Badge>
                <Badge className="text-sm" variant="outline" onClick={e => {
                    e.stopPropagation();
                    setAmount(token, balance / 2n)
                }}>
                    50%
                </Badge>
                <Badge className="text-sm" variant="outline" onClick={e => {
                    e.stopPropagation();
                    setAmount(token, balance * 3n / 4n)
                }}>
                    75%
                </Badge>
                <Badge className="text-sm" variant="outline" onClick={e => {
                    e.stopPropagation();
                    setAmount(token, balance)
                }}>
                    100%
                </Badge>
                <Badge className="text-sm" variant="outline">
                    <input
                        className="text-sm font-semibold bg-transparent border-none focus:ring-0 focus:outline-none text-white w-12"
                        value={inputValue}
                        placeholder="0"
                        onChange={e => {
                            setInputValue(e.target.value);
                            const newAmount = parseFloat(e.target.value);
                            if (!isNaN(newAmount) && isFinite(newAmount)) {
                                const bigAmount = BigInt(Math.round(newAmount));
                                setAmount(token, balance * bigAmount / 100n)
                            }
                        }}
                        ref={inputRef}
                        type="text"
                        onClick={(e) => e.stopPropagation()}
                    />
                    %
                </Badge>
            </div>
        </TooltipContent>
    </Tooltip>
}

export function TokenInput({
    token,
    mode
}: {
    token: Token,
    mode: "input" | "output"
}) {
    const { address } = useAccount()
    const { chain } = useNetwork()
    const { data } = useBalance({
        address,
        token: token.address !== zeroAddress ? token.address as `0x${string}` : undefined,
        chainId: chain?.id
    })
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
        <div className="flex flex-wrap items-center justify-between p-4 rounded">
            <div className="flex flex-col  items-start w-full">
                <div className="flex items-center space-x-2">
                    <Tooltip>
                        <TooltipTrigger>
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
                        </TooltipTrigger>
                        <TooltipContent>
                            <div className="text-left p-4">
                                <div className="text-base font-semibold">{token.label} Token</div>
                                <FormatTokenAddress token={token} />
                            </div>
                        </TooltipContent>
                    </Tooltip>
                    <input
                        aria-label="Token amount"
                        className="text-2xl font-semibold bg-transparent border-none focus:ring-0 focus:outline-none w-full"
                        value={inputValue}
                        disabled={mode == 'output'}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        type="text"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {(data && mode == 'input' && data.value > 0n) && <PercentageSelector token={token} balance={data.value} />}
                </div>
            </div>
            <div className="flex flex-row justify-between w-full">
                {/* <div className="text-xl font-semibold text-blue-500 text-right">{token.label}</div> */}
                <div className="text-sm font-normal text-gray-500 text-left">≈{formatUnits((parseUnits(token.priceUSD?.toString() ?? "", 9) * _value), 9 + token.decimals)} $</div>
                {data && <div className="text-sm font-normal text-gray-500 text-right"><Wallet2Icon className="w-3 h-3 inline mr-1" />{formatUnits(data.value, token.decimals).slice(0, 10)} {token.ticker}</div>}
            </div>
        </div>
    </div>
}