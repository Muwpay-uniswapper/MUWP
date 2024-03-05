"use client"

import * as React from "react"
import { Check, ChevronDown, Loader2 } from "lucide-react"
import { useAccount, useSwitchChain } from "wagmi"
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
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Chain } from "@/lib/core/model/CellLike";
import { useSwapStore } from "@/lib/core/data/swapStore"
import { useBreakpoint } from "@/lib/core/media-query";
import { AddressSelector } from "./AddressSelector";

export function ChainCombobox({
    index,
    chainList,
    mode
}: {
    index?: number,
    chainList: Chain[],
    mode: "input" | "output"
}) {
    let Container;
    let ContainerTrigger;
    let ContainerContent;

    const [open, setOpen] = React.useState(false)

    const { isAboveMd } = useBreakpoint("md")

    const { chain } = useAccount()
    const { outputChain, targetAddress, setTargetAddress } = useSwapStore()
    const { isPending, reset, switchChain, variables } = useSwitchChain({
        mutation: {
            onSettled: () => {
                reset(); // reset mutation variables (eg. pendingChainId, error
            },
        }
    })

    const value = chainList.find(_chain =>
        mode == "input" ?
            (isPending
                ? (variables?.chainId == _chain.chainId)
                : (chain?.id == _chain.chainId))
            : outputChain == _chain.chainId
    )

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

    return <>
        <Container open={open} onOpenChange={setOpen}>
            <ContainerTrigger asChild id={`${mode}-chain-combo-${index}`}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full h-auto rounded-xl transition-transform", value ? "p-0 overflow-clip border-none hover:scale-[1.025]" : "border-dashed border border-gray-300")}
                    style={{
                        background: "var(--rk-colors-connectButtonBackground)"
                    }}
                >
                    {value
                        ? <div className="flex flex-row items-center p-2 relative">
                            {isPending && <Loader2 className="h-10 w-10 animate-spin absolute left-1 text-blue-500" />}
                            <img src={value?.logoURI} alt={value.label} className="mr-2 h-8 w-8 rounded-full" />
                            <div className="">{value.label}</div>
                            <ChevronDown />
                        </div>
                        : <div className="grid gap-2 place-items-center">
                            <img src="/icons/plus.diamond.fill.svg" alt="plus" className="mr-2 h-8 w-8 opacity-50" />
                            <div className="opacity-50">Select Chain</div>
                        </div>}
                </Button>
            </ContainerTrigger>
            <ContainerContent side="right">
                <ChainListContent value={value} tokenList={chainList} setOpen={setOpen} mode={mode} switchNetwork={id => {
                    if (typeof id === "undefined") return
                    switchChain({ chainId: id })
                }} isAboveMd={isAboveMd} />
            </ContainerContent>
        </Container>
        {value && mode == "output" && <AddressSelector
            targetAddress={targetAddress ?? ""}
            setTargetAddress={setTargetAddress}
            chain={value!}
        />}
    </>
}
function ChainListContent({
    value,
    tokenList: chainList,
    setOpen,
    mode,
    switchNetwork,
    isAboveMd
}: {
    value?: Chain,
    tokenList: Chain[],
    setOpen: (open: boolean) => void,
    mode: "input" | "output",
    switchNetwork?: (chainId: number | undefined) => void,
    isAboveMd: boolean
}) {
    const [search, setSearch] = React.useState("")
    const { setOutputChain, inputTokens, removeInputToken } = useSwapStore()


    return <Command
        filter={(value: string, search) => {
            if (value.includes(search.toLowerCase())) return 1;
            return 0;
        }}
        className={cn(isAboveMd ? "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5" : "")}
    >
        <CommandInput placeholder="Search chain..." value={search} onValueChange={setSearch} />
        <CommandList>
            <CommandEmpty>No chain found.</CommandEmpty>
            <CommandGroup>
                {chainList
                    ?.filter((chain) => chain.label?.toLowerCase().includes(search.toLowerCase()) || chain === value)
                    ?.map((chain) => (
                        <CommandItem
                            key={chain.value}
                            value={chain.value}
                            onSelect={(currentValue) => {
                                const chain = chainList.find(a => a.value.toLowerCase() == currentValue)
                                if (value?.value.toLowerCase() == currentValue) return setOpen(false); // You can't remove the current chain
                                if (mode == "input") {
                                    switchNetwork?.(chain?.chainId)
                                    for (let i = 0; i < inputTokens.length; i++) {
                                        removeInputToken(i);
                                    }
                                } else {
                                    setOutputChain(chain?.chainId ?? null)
                                }

                                setOpen(false);
                            }}
                        >
                            <Check
                                className={cn(
                                    "mr-2 h-4 w-4",
                                    value?.value.toLowerCase?.() === chain.value.toLowerCase() ? "opacity-100" : "opacity-0"
                                )} />
                            <img src={chain?.logoURI} alt="logo" className="mr-2 h-4 w-4" />
                            {(chain.label?.length ?? 0) > 20 ? `${chain.label?.substring(0, 20)}...` : (chain.label ?? chain.value)}
                        </CommandItem>
                    ))}
            </CommandGroup>
        </CommandList>
    </Command>;
}