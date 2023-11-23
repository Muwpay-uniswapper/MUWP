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
import { Token } from "@/lib/front/model/CellLike"
import { useSwapStore } from "@/lib/front/data/swapStore"
import { useBreakpoint } from "@/lib/front/media-query";

export function TokenComboboxes({ tokenList }: { tokenList: Token[] }) {
    const tokenCount = useSwapStore((state) => state.inputTokens.length)

    return <>
        {Array.from(Array(tokenCount + 1).keys()).map((index) => {
            return <TokenCombobox index={index} tokenList={tokenList} mode="input" />
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

    const { inputTokens, setInputToken, outputToken, setOutputToken } = useSwapStore()

    const value = mode == "input" ? inputTokens[index ?? 0] : outputToken

    if (isAboveMd) {
        Container = Popover
        ContainerTrigger = PopoverTrigger
        ContainerContent = PopoverContent
    } else {
        Container = (props: any) => <Drawer.Root {...props} shouldScaleBackground />
        ContainerTrigger = Drawer.Trigger
        ContainerContent = (props: any) => (
            <Drawer.Portal><Drawer.Overlay className="fixed inset-0 bg-black/40" /><Drawer.Content {...props} /></Drawer.Portal>
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
            <ContainerContent side="right" className="bg-gray-100 flex flex-col rounded-t-[10px] h-full mt-24 max-h-[75%] fixed bottom-0 left-0 right-0 md:bg-transparent md:block md:rounded-md md:h-auto md:mt-0 md:max-h-full md:relative md:top-auto md:left-auto md:right-auto md:p-0">
                <TokenListContent index={index} tokenList={tokenList} setOpen={setOpen} mode={mode} />
            </ContainerContent>
        </Container>
    )
}
function TokenListContent({
    index,
    tokenList,
    setOpen,
    mode
}: {
    index?: number,
    tokenList: Token[],
    setOpen: (open: boolean) => void,
    mode: "input" | "output"
}) {

    const [search, setSearch] = React.useState("")
    const { inputTokens, setInputToken, outputToken, setOutputToken, removeInputToken } = useSwapStore()
    const [hydrated, setHydrated] = React.useState(false)
    React.useEffect(() => {
        setHydrated(true)
        setSearch("")
    }, [])
    const value = mode == "input" ? inputTokens[index ?? 0] : outputToken

    return <Command
        filter={(value: string, search) => {
            if (value.includes(search.toLowerCase())) return 1;
            return 0;
        }}
    >
        <CommandInput placeholder="Search token..." value={search} onValueChange={setSearch} />
        <CommandEmpty>
            <div className="h-4">
                No token found.
            </div>
        </CommandEmpty>
        <CommandGroup>
            {tokenList
                .filter((token) => token.value.toLowerCase().includes(search.toLowerCase()) && !(inputTokens.includes(token) && token !== value))
                .slice(0, 10)
                .map((token) => (
                    <CommandItem
                        key={token.value}
                        value={token.value}
                        onSelect={(currentValue) => {
                            if (value?.value.toLowerCase() == currentValue) {
                                if (mode == "input") removeInputToken(index);
                                else setOutputToken(null)
                            } else {
                                const token = tokenList.find((token) => token.value.toLowerCase() === currentValue.toLowerCase());
                                if (token && mode == "input") setInputToken(token, index ?? 0);
                                else if (token && mode == "output") setOutputToken(token);
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
                    </CommandItem>
                ))}
        </CommandGroup>
    </Command>;
}