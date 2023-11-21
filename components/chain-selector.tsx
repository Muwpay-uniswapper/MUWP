"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { useNetwork } from "wagmi"
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
import { Chain } from "@/lib/front/model/CellLike";
import { useSwapStore } from "@/lib/front/data/swapStore"
import { useBreakpoint } from "@/lib/front/media-query";

export function ChainCombobox({
    index,
    chainList
}: {
    index?: number,
    chainList: Chain[]
}) {
    let Container;
    let ContainerTrigger;
    let ContainerContent;

    const [open, setOpen] = React.useState(false)

    const { isAboveMd } = useBreakpoint("md")

    const { chain } = useNetwork()

    const value = chainList.find(_chain => chain?.id == _chain.chainId)

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
                    className={cn("w-full h-auto rounded-xl mr-2 transition-transform", value ? "p-0 overflow-clip border-none hover:scale-[1.025]" : "border-dashed border border-gray-300")}
                    style={{
                        background: "var(--rk-colors-connectButtonBackground)"
                    }}
                >
                    {value
                        ? <div className="flex flex-row items-center p-2">
                            <img src={value.logoURI} alt={value.label} className="mr-2 h-8 w-8 rounded-full" />
                            <div className="">{value.label}</div>
                            <ChevronDown />
                        </div>
                        : <div className="grid gap-2 place-items-center">
                            <img src="/icons/plus.diamond.fill.svg" alt="plus" className="mr-2 h-8 w-8 opacity-50" />
                            <div className="opacity-50">Select Chain</div>
                        </div>}
                </Button>
            </ContainerTrigger>
            <ContainerContent side="right" className="bg-gray-100 flex flex-col rounded-t-[10px] h-full mt-24 max-h-[75%] fixed bottom-0 left-0 right-0 md:bg-transparent md:block md:rounded-md md:h-auto md:mt-0 md:max-h-full md:relative md:top-auto md:left-auto md:right-auto md:p-0">
                <ChainListContent value={value} tokenList={chainList} setOpen={setOpen} />
            </ContainerContent>
        </Container>
    )
}
function ChainListContent({
    value,
    tokenList: chainList,
    setOpen
}: {
    value?: Chain,
    tokenList: Chain[],
    setOpen: (open: boolean) => void
}) {
    const [search, setSearch] = React.useState("")

    return <Command
        filter={(value: string, search) => {
            if (value.includes(search.toLowerCase())) return 1;
            return 0;
        }}
    >
        <CommandInput placeholder="Search chain..." value={search} onValueChange={setSearch} />
        <CommandEmpty>No token found.</CommandEmpty>
        <CommandGroup>
            {chainList
                .filter((chain) => chain.label.toLowerCase().includes(search.toLowerCase()) || chain === value)
                .slice(0, 10)
                .map((token) => (
                    <CommandItem
                        key={token.value}
                        value={token.label}
                        onSelect={(currentValue) => {
                            // const token = chainList.find((token) => token.label.toLowerCase() === currentValue.toLowerCase());
                            // if (token) setInputToken(token, index ?? 0);
                            setOpen(false);
                        }}
                    >
                        <Check
                            className={cn(
                                "mr-2 h-4 w-4",
                                value?.label.toLowerCase?.() === token.label.toLowerCase() ? "opacity-100" : "opacity-0"
                            )} />
                        <img src={token.logoURI} alt="logo" className="mr-2 h-4 w-4" />
                        {token.label.length > 20 ? `${token.label.substring(0, 20)}...` : token.label}
                    </CommandItem>
                ))}
        </CommandGroup>
    </Command>;
}