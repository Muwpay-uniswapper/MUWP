
import { WalletName, useWallet } from "@aptos-labs/wallet-adapter-react";
import { Chain } from "@/lib/core/model/CellLike";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, Wallet2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command";
import { cn } from "@/lib/core/utils";


export function AddressSelector({
    targetAddress,
    setTargetAddress,
    chain
}: {
    targetAddress: string,
    setTargetAddress: (address: string) => void,
    chain: Chain
}) {
    const { connected, account } = useWallet();
    useEffect(() => {
        setTargetAddress(connected ? account?.address || "" : "")
    }, [connected])

    return <div className="relative">
        <Input placeholder={`Your ${chain?.label} address`}
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)} />
        <WalletCombobox className="absolute right-0 top-0" />
    </div>
}

export function WalletCombobox({
    className,
    message
}: {
    className?: string,
    message?: string
}) {
    const [open, setOpen] = useState(false);
    const { connect, connected, account, wallet: connectedWallet, disconnect, wallets } = useWallet();

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button className={className} variant={"outline"} size={(message?.length ?? 0) > 0 ? "default" : "icon"}>
                    <Wallet2Icon className="w-4 h-4 inline mr-1" />
                    {message}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search wallet..." />
                    <CommandEmpty>No wallet found.</CommandEmpty>
                    <CommandGroup>
                        {wallets.map((wallet) => (
                            <CommandItem
                                key={wallet.name}
                                value={wallet.name}
                                onSelect={(currentValue) => {
                                    setOpen(false)
                                    if (connected) {
                                        disconnect()
                                    }
                                    connect(wallet.name)
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        connectedWallet?.name === wallet.name ? "opacity-100" : "opacity-0"
                                    )}
                                />
                                <img
                                    className="w-4 h-4 mr-2 inline-block"
                                    src={wallet.icon}
                                    alt={wallet.name}
                                />
                                {wallet.name}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </Command>
            </PopoverContent>
        </Popover>
    )
}