"use client";

import React, { useEffect, useState } from "react"
import { useConnect, useConnections, useConnectors } from "wagmi"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
} from "@/components/ui/accordion"
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { ChevronDown, X } from "lucide-react";
import { Button } from "../ui/button";
import { Status } from "@/components/ui/pulse";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { useRouteStore } from "@/lib/core/data/routeStore";
import { cn } from "@/lib/core/utils";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AllocationWallet from "./AllocationWallets";


export function Wallets() {
    const { multiWallets } = useRouteStore();
    const { connect } = useConnect();
    const connectors = useConnectors();
    const connections = useConnections()
    const [accounts, setAccounts] = useState<{ [key: string]: readonly `0x${string}`[] }>({});

    // Remove duplicate connectors
    const _connectors = connectors.filter((connector, index, self) =>
        connector.icon && self.findIndex((c) => c.id === connector.id) === index
    );

    useEffect(() => {
        console.log(connections)
        const _accounts: { [key: string]: readonly `0x${string}`[] } = {}
        for (const connection of connections) {
            _accounts[connection.connector.id] = connection.accounts
        }
        setAccounts(_accounts);
        console.log("Mutated accounts")
    }, [connections.map((connected) => connected.connector.id).join(",")]);

    return <>
        <h2 className="text-2xl font-medium mb-4">Multi Wallet</h2>
        <p className="mb-4">Select the wallets you want to use for this transaction.</p>
        <Tabs defaultValue="wallets" className="w-full">
            <TabsList className="w-full">
                <TabsTrigger value="wallets" className="w-full">{Array.isArray(multiWallets) && multiWallets.length > 0 ? (
                    <span>{multiWallets.length} wallets selected</span>
                ) : (
                    <span>Select Wallets</span>
                )}</TabsTrigger>
                <TabsTrigger value="allocation" className="w-full">Allocation</TabsTrigger>
            </TabsList>
            <TabsContent value="wallets">
                <Accordion type="single" collapsible >
                    {_connectors.map((connector) => (
                        <AccordionItem key={connector.uid} value={connector.uid}>
                            <AccordionPrimitive.Header className="flex">
                                {accounts[connector.id]?.length > 0 ? (
                                    <AccordionPrimitive.Trigger
                                        className="flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180"
                                    >
                                        <span>{connector.icon && <img src={connector.icon} className="w-4 h-4 inline mr-1" />} {connector.name} <Status connected={true} auto /></span>
                                        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
                                    </AccordionPrimitive.Trigger>
                                ) : (
                                    <div className="flex flex-1 items-center justify-between py-4 font-medium">
                                        <span>
                                            {connector.icon && <img src={connector.icon} className="w-4 h-4 inline mr-1" />}
                                            {connector.name}
                                        </span>
                                        <Button onClick={() => connect({ connector })} className="h-4" variant="outline">Connect</Button>
                                    </div>
                                )}
                            </AccordionPrimitive.Header>
                            <AccordionContent>
                                {accounts[connector.id]?.map((account, index) => (
                                    <div key={index}>
                                        <div className="flex items-center space-x-2 my-1">
                                            <Checkbox id={account} onCheckedChange={(checked) => {
                                                useRouteStore.setState((state) => {
                                                    let multiWallets = state.multiWallets;
                                                    if (Array.isArray(multiWallets)) {
                                                        if (checked && !multiWallets.includes(account)) {
                                                            multiWallets.push(account);
                                                        } else {
                                                            multiWallets.splice(multiWallets.indexOf(account), 1);
                                                        }
                                                    } else {
                                                        multiWallets = [account];
                                                    }
                                                    return { multiWallets };
                                                })
                                            }} checked={multiWallets?.includes(account)} />
                                            <Label htmlFor={account}>{account}</Label>
                                        </div>
                                    </div>
                                ))}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </TabsContent>
            <TabsContent value="allocation">
                <AllocationWallet />
            </TabsContent>
        </Tabs>
    </>
}

export function WalletAccessor() {
    const [open, setOpen] = React.useState(false);
    const { multiWallets } = useRouteStore();

    return <div className={cn("absolute left-0 bg-background text-primary border rounded-sm transition-all z-50 shadow-white/50 ", open ? "top-0 w-full shadow-2xl" : "-top-14")}>
        {open && <div className="p-4 transition-all">
            <Wallets />
            <button className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground" onClick={() => setOpen(!open)}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </button>
        </div>}
        {!open && <Button variant="ghost" className="relative" onClick={() => setOpen(!open)}>
            Wallets
            <Badge className="absolute -top-2 -right-4">{multiWallets?.length ?? 1}</Badge>
        </Button>}
    </div>
}