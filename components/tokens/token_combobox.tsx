"use client"

import * as React from "react"
import { BadgeCheck, Check } from "lucide-react"
import { Drawer } from 'vaul';
import { cn } from "@/lib/core/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { TokenInput } from "./token_input"
import { Token } from "@/lib/core/model/CellLike"
import { useSwapStore } from "@/lib/core/data/swapStore"
import { useBreakpoint } from "@/lib/core/media-query";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { useNetwork } from "wagmi";
import Allocation from "./allocation";

export function TokenComboboxes({ tokenList, mode }: { tokenList: Token[], mode: "input" | "output" }) {
    const tokenCount = useSwapStore((state) => {
        const inputTokens = state.inputTokens.filter((token) => token)
        const outputTokens = state.outputTokens.filter((token) => token)
        if (mode == "input" && outputTokens.length > 1) return 1
        if (mode == "output" && inputTokens.length > 1) return 1
        return 1 + (mode == "input" ? inputTokens.length : outputTokens.length)
    })

    return <>
        {mode == "output" && tokenCount > 2 && <Allocation />}
        {Array.from(Array(tokenCount).keys()).map((index) => {
            return <TokenCombobox index={index} tokenList={tokenList} mode={mode} key={index} />
        })}
    </>
}

export function TokenCombobox({
    index,
    tokenList,
    mode
}: {
    index?: number,
    tokenList: Token[],
    mode: "input" | "output"
}) {
    let Container;
    let ContainerTrigger;
    let ContainerContent;

    const [open, setOpen] = React.useState(false)

    const { isAboveMd } = useBreakpoint("md")

    const { inputTokens, outputTokens: outputToken } = useSwapStore()

    const value = mode == "input" ? inputTokens[index ?? 0] : outputToken[index ?? 0]

    if (isAboveMd) {
        Container = Dialog
        ContainerTrigger = DialogTrigger
        ContainerContent = (props: any) => <DialogContent className="overflow-hidden p-0 shadow-lg" {...props} />
    } else {
        Container = (props: any) => <Drawer.Root {...props} shouldScaleBackground />
        ContainerTrigger = Drawer.Trigger
        ContainerContent = (props: any) => (
            <Drawer.Portal><Drawer.Overlay className="fixed inset-0 bg-black/40" /><Drawer.Content {...props} className="bg-gray-100 flex flex-col rounded-t-[10px] h-full mt-24 max-h-[75%] fixed bottom-0 left-0 right-0 md:bg-transparent md:block md:rounded-md md:h-auto md:mt-0 md:max-h-full md:relative md:top-auto md:left-auto md:right-auto md:p-0" /></Drawer.Portal>
        )
    }

    return (
        <Container open={open} onOpenChange={setOpen}>
            <ContainerTrigger asChild id={`token-combo-${index}`}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        "w-full border h-auto",
                        value ? "p-0 overflow-clip" : "border-dashed border-gray-300 rounded-md p-2",
                        !value && (inputTokens.length % 2 == 0) ? "col-span-full" : ""
                    )}
                >
                    {value
                        ? <TokenInput token={value} mode={mode} />
                        : <div className="grid gap-2 place-items-center">
                            <img src="/icons/plus.diamond.fill.svg" alt="plus" className="mr-2 h-8 w-8 opacity-50" />
                            <div className="opacity-50">Select Token</div>
                        </div>}
                </Button>
            </ContainerTrigger>
            <ContainerContent side="right">
                <TokenListContent index={index} tokenList={tokenList} setOpen={setOpen} mode={mode} isAboveMd={isAboveMd} />
            </ContainerContent>
        </Container>
    )
}
function TokenListContent({
    index,
    tokenList,
    setOpen,
    mode,
    isAboveMd
}: {
    index?: number,
    tokenList: Token[],
    setOpen: (open: boolean) => void,
    mode: "input" | "output",
    isAboveMd: boolean
}) {

    const [search, setSearch] = React.useState("")
    const { chain } = useNetwork()
    const { inputTokens, setInputToken, outputTokens, setOutputToken, removeInputToken, removeOutputToken, outputChain } = useSwapStore()
    const [hydrated, setHydrated] = React.useState(false)
    React.useEffect(() => {
        setHydrated(true)
        setSearch("")
    }, [hydrated])
    const value = mode == "input" ? inputTokens[index ?? 0] : outputTokens[index ?? 0]

    return <Command
        className={cn(isAboveMd ? "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5" : "")}
        value={search}
        onValueChange={setSearch}
        loop
    >
        <CommandInput placeholder="Search token..." />
        <CommandList>
            <CommandEmpty>
                <div className="h-4">
                    No token found.
                </div>
            </CommandEmpty>
            <CommandGroup>
                {tokenList
                    .filter((token) => {
                        if (mode == "input" && chain && token.chainId !== chain.id) return false
                        if (mode == "output" && outputChain && token.chainId !== outputChain) return false
                        if (token.value.toLowerCase() == value?.value.toLowerCase()) return true
                        if (inputTokens.find((_token) => _token?.value.toLowerCase() == token.value.toLowerCase())) return false
                        if (outputTokens.find((_token) => _token?.value.toLowerCase() == token.value.toLowerCase())) return false
                        return true
                    })
                    .map((token) => (
                        <CommandItem
                            key={token.value}
                            value={token.value}
                            onSelect={(currentValue) => {
                                if (value?.value.toLowerCase() == currentValue) {
                                    if (mode == "input") removeInputToken(index);
                                    else removeOutputToken(index);
                                } else {
                                    const token = tokenList.find((token) => token.value.toLowerCase() === currentValue.toLowerCase());
                                    if (token && mode == "input") setInputToken(token, index ?? 0);
                                    else if (token && mode == "output") setOutputToken(token, index ?? 0);
                                }
                                setOpen(false);
                            }}
                        >
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    value?.value.toLowerCase?.() === token.value.toLowerCase() ? "opacity-100" : "opacity-0"
                                )} />
                            <img src={token.logoURI} alt="logo" className="mr-2 h-4 w-4" />
                            {token.label.length > 20 ? `${token.label.substring(0, 20)}...` : token.label}
                            {token.verified && <BadgeCheck className="inline scale-75 opacity-50 ml-1" />}
                            {value?.value.toLowerCase?.() === token.value.toLowerCase() && <span className="text-red-500 absolute right-2 cursor-pointer">Remove token</span>}
                        </CommandItem>
                    ))}
            </CommandGroup>
        </CommandList>
    </Command>;
}