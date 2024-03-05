"use client";

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "../ui/checkbox"
import { Exchange } from "@/lib/li.fi-ts"
import { ChainIcon } from "connectkit"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useSwapStore } from "@/lib/core/data/swapStore";

export const columns: ColumnDef<Exchange>[] = [
    {
        id: "select",
        header: () => null,
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => {
                    useSwapStore.setState((state) => {
                        const allowDenyExchanges = { ...state.allowDenyExchanges };
                        if (allowDenyExchanges.deny?.includes(row.original.key ?? "")) {
                            allowDenyExchanges.deny = allowDenyExchanges.deny.filter(b => b !== row.original.key);
                        } else {
                            allowDenyExchanges.deny?.push(row.original.key ?? "");
                        }
                        return { allowDenyExchanges };
                    })
                }}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "icon",
        header: () => null,
        cell: ({ row }) => (
            <img
                src={row.original?.logoURI}
                alt={row.getValue("name")}
                className="w-6 h-6 rounded-full"
            />
        ),
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "supportedChains",
        header: "Supported Chains",
        cell: ({ row }) => (
            <div className="flex flex-row gap-1">
                {row.original.supportedChains?.map((chain) => <Tooltip key={chain} >
                    <TooltipTrigger>
                        <ChainIcon id={chain} key={chain} />
                    </TooltipTrigger>
                    <TooltipContent>
                        Chain ID: {chain}
                    </TooltipContent>
                </Tooltip>)}
            </div>
        ),
    }
]