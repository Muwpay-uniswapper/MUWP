"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Drawer } from 'vaul';
import { cn } from "@/lib/front/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { TokenInput } from "./token_input"
import { Token } from "@/lib/front/model/Token"
import { useSwapStore } from "@/lib/front/data/swapStore"
import { useBreakpoint } from "@/lib/front/media-query";

export function TokenComboboxes({ tokenList }: { tokenList: Token[] }) {
    const tokenCount = useSwapStore((state) => state.inputTokens.length)

    return <>
        {Array.from(Array(tokenCount + 1).keys()).map((index) => {
            return <TokenCombobox index={index} tokenList={tokenList} />
        })}
    </>
}

export function TokenCombobox({
    index,
    tokenList
}: {
    index?: number,
    tokenList: Token[]
}) {
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState("")
    const { inputTokens, setInputToken } = useSwapStore()
    const { isAboveMd } = useBreakpoint("md")

    const value = inputTokens[index ?? 0]

    let Container = (props: any) => <Drawer.Root {...props} shouldScaleBackground />
    let ContainerTrigger = Drawer.Trigger
    let ContainerContent = (props: any) => (
        <Drawer.Portal><Drawer.Overlay className="fixed inset-0 bg-black/40" /><Drawer.Content {...props} /></Drawer.Portal>
    )

    if (isAboveMd) {
        Container = Popover
        ContainerTrigger = PopoverTrigger
        ContainerContent = PopoverContent
    }

    return (
        <Container open={open} onOpenChange={setOpen}>
            <ContainerTrigger asChild id={`token-combo-${index}`}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full border h-auto", value ? "p-0 overflow-clip" : "border-dashed border-gray-300 rounded-md p-2")}
                >
                    {value
                        ? <TokenInput token={value} />
                        : <div className="grid gap-2 place-items-center">
                            <img src="/icons/plus.diamond.fill.svg" alt="plus" className="mr-2 h-8 w-8 opacity-50" />
                            <div className="opacity-50">Select Token</div>
                        </div>}
                </Button>
            </ContainerTrigger>
            <ContainerContent side="right" className="bg-gray-100 flex flex-col rounded-t-[10px] h-full mt-24 max-h-[75%] fixed bottom-0 left-0 right-0 vaul-dragging md:bg-transparent md:block md:rounded-md md:h-auto md:mt-0 md:max-h-full md:relative md:top-auto md:left-auto md:right-auto md:p-0">
                <Command
                    filter={(value: string, search) => {
                        if (value.includes(search.toLowerCase())) return 1
                        return 0
                    }}
                >
                    <CommandInput placeholder="Search token..." value={search} onValueChange={setSearch} />
                    <CommandEmpty>No token found.</CommandEmpty>
                    <CommandGroup>
                        {tokenList
                            .filter((token) => token.label.toLowerCase().includes(search.toLowerCase()) && !(inputTokens.includes(token) && token !== value))
                            .slice(0, 10)
                            .map((token) => (
                                <CommandItem
                                    key={token.value}
                                    value={token.label}
                                    onSelect={(currentValue) => {
                                        const token = tokenList.find((token) => token.label.toLowerCase() === currentValue.toLowerCase())
                                        if (token) setInputToken(token, index ?? 0)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value?.label.toLowerCase?.() === token.label.toLowerCase() ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <img src={token.logoURI} alt="logo" className="mr-2 h-4 w-4" />
                                    {token.label.length > 20 ? `${token.label.substring(0, 20)}...` : token.label}
                                </CommandItem>
                            ))}
                    </CommandGroup>
                </Command>
            </ContainerContent>
        </Container>
    )
}