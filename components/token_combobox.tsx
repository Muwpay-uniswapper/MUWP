"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

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

export function TokenCombobox({
    id,
    tokenList
}: {
    id?: string,
    tokenList: { value: string, label: string, logoURI: string, priceUSD: string }[]
}) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(false)
    const [search, setSearch] = React.useState("")

    React.useEffect(() => {
        console.log(value)
    }, [value])

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild id={id}>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full border border-dashed border-gray-300 rounded-md p-2 h-auto"
                >
                    {value
                        ? [tokenList.find((token) => token.label.toLowerCase() === value)].map((token =>
                            <TokenInput token={token} />
                        ))
                        : <div className="grid gap-2 place-items-center">
                            <img src="/icons/plus.diamond.fill.svg" alt="plus" className="mr-2 h-8 w-8 opacity-50" />
                            <div className="opacity-50">Select Token</div>
                        </div>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command
                    filter={(value: any, search) => {
                        if (value.includes(search.toLowerCase())) return 1
                        return 0
                    }}
                >
                    <CommandInput placeholder="Search token..." value={search} onValueChange={setSearch} />
                    <CommandEmpty>No token found.</CommandEmpty>
                    <CommandGroup>
                        {tokenList
                            .filter((token) => token.label.toLowerCase().includes(search.toLowerCase()))
                            .slice(0, 10)
                            .map((token) => (
                                <CommandItem
                                    key={token.value}
                                    value={token.label}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? {} : currentValue)
                                        setOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === token.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {token.label}
                                </CommandItem>
                            ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}