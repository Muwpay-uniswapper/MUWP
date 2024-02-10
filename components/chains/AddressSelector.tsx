import { FewchaWallet } from "fewcha-plugin-wallet-adapter";
import { ShadowWallet } from "@flipperplatform/wallet-adapter-plugin";
import { MartianWallet } from "@martianwallet/aptos-wallet-adapter";
import { NightlyWallet } from "@nightlylabs/aptos-wallet-adapter-plugin";
import { PetraWallet } from "petra-plugin-wallet-adapter";
import { PontemWallet, PontemWalletName } from "@pontem/wallet-adapter-plugin";
import { RiseWallet } from "@rise-wallet/wallet-adapter";
import { TokenPocketWallet } from "@tp-lab/aptos-wallet-adapter";
import { TrustWallet } from "@trustwallet/aptos-wallet-adapter";
import { MSafeWalletAdapter } from "@msafe/aptos-wallet-adapter";
import { WelldoneWallet } from "@welldone-studio/aptos-wallet-adapter";
import { OKXWallet } from "@okwallet/aptos-wallet-adapter";
import { OnekeyWallet } from "@onekeyfe/aptos-wallet-adapter";
import { AptosWalletAdapterProvider, WalletName, useWallet } from "@aptos-labs/wallet-adapter-react";
import { Chain } from "@/lib/core/model/CellLike";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Check, Wallet2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command";
import { cn } from "@/lib/core/utils";

export const AptosWallets = [
    new FewchaWallet(),
    new ShadowWallet(),
    new MartianWallet(),
    new MSafeWalletAdapter(),
    new NightlyWallet(),
    new PetraWallet(),
    new PontemWallet(),
    new RiseWallet(),
    new TokenPocketWallet(),
    new TrustWallet(),
    new WelldoneWallet(),
    new OKXWallet(),
    new OnekeyWallet(),
];

export function AddressSelector({
    targetAddress,
    setTargetAddress,
    chain
}: {
    targetAddress: string,
    setTargetAddress: (address: string) => void,
    chain: Chain
}) {
    return <AptosWalletAdapterProvider plugins={AptosWallets} onError={(e) => {
        console.error(e)
    }}>
        <InputAddressSelector targetAddress={targetAddress} setTargetAddress={setTargetAddress} chain={chain} />
    </AptosWalletAdapterProvider>
}

export function InputAddressSelector({
    targetAddress,
    setTargetAddress,
    chain
}: {
    targetAddress: string,
    setTargetAddress: (address: string) => void,
    chain: Chain
}) {
    const { connect, connected, account, wallet, disconnect, isLoading } = useWallet();

    useEffect(() => {
        setTargetAddress(connected ? account?.address || "" : "")
    }, [connected])

    return <div className="relative">
        <Input placeholder={`Your ${chain?.label} address`}
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)} />
        {!isLoading && <WalletCombobox connect={connect} connected={wallet?.name} disconnect={disconnect} />}
    </div>
}

export function WalletCombobox({
    connect,
    connected,
    disconnect
}: {
    connect: (wallet: WalletName) => void;
    connected: WalletName | undefined;
    disconnect: () => void;
}) {
    const [open, setOpen] = useState(false)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button className="absolute right-0 top-0" variant={"outline"} size="icon">
                    <Wallet2Icon className="w-4 h-4 inline mr-1" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search wallet..." />
                    <CommandEmpty>No wallet found.</CommandEmpty>
                    <CommandGroup>
                        {AptosWallets.map((wallet) => (
                            <CommandItem
                                key={wallet.name}
                                value={wallet.name}
                                onSelect={(currentValue) => {
                                    setOpen(false)
                                    if (connected) {
                                        disconnect()
                                    }
                                    connect(currentValue as WalletName)
                                }}
                            >
                                <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        connected === wallet.name ? "opacity-100" : "opacity-0"
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