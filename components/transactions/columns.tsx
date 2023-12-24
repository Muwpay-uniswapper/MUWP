"use client";

import { Transaction } from "@/lib/front/data/routeStore";
import { ColumnDef } from "@tanstack/react-table"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Route } from "@lifi/sdk";
import { formatUnits } from "viem";
import TxActions from "./txActions";
import Status from "./status";


export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
            const id = row.getValue("id") as string
            const shorthash = `${id.slice(0, 6)}...${id.slice(-4)}`
            return <Tooltip>
                <TooltipTrigger>{shorthash}</TooltipTrigger>
                <TooltipContent>
                    {id}
                </TooltipContent>
            </Tooltip>
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            return <Status row={row} />
        },
    },
    {
        accessorKey: "routes",
        header: "ETA",
        cell: ({ row }) => {
            const routes = row.getValue("routes") as Route[]
            let duration = routes.map((route) => route.steps.map((step) => step.estimate?.executionDuration ?? 0).reduce((a, b) => a + b, 0)).reduce((a, b) => Math.max(a, b), 0); // Steps are executed in parallel, so we take the max
            if (duration > 0) {
                duration += 3 * 60; // Add 3 min for the transaction to be mined
            }
            return `${Math.ceil(duration / 60)} min`
        }
    },
    {
        accessorKey: "routes",
        header: "gasFees",
        cell: ({ row }) => {
            const routes = row.getValue("routes") as Route[]
            const gasFees = routes.map((route) => Number(route.gasCostUSD)).reduce((a, b) => a + b, 0);
            return `$${(gasFees).toFixed(2)}`
        }
    },
    {
        accessorKey: "routes",
        header: "Fees",
        cell: ({ row }) => {
            const routes = row.getValue("routes") as Route[]
            const feeCosts = routes.map((route) => route.steps.map((step) => step.estimate?.feeCosts?.map((fee) => Number(fee.amountUSD))?.reduce((a, b) => a + b, 0) ?? 0).reduce((a, b) => a + b, 0)).reduce((a, b) => a + b, 0);
            return `$${(feeCosts).toFixed(2)}`
        }
    },
    {
        accessorKey: "routes",
        header: "Input",
        cell: ({ row }) => {
            const routes = row.getValue("routes") as Route[]
            return <div className="flex flex-row gap-1">
                {routes.map((route) => <Tooltip>
                    <TooltipTrigger>
                        <img src={route.fromToken.logoURI} alt={route.fromToken.symbol} className="w-4 h-4 rounded-full" />
                    </TooltipTrigger>
                    <TooltipContent>
                        {formatUnits(BigInt(route.fromAmount), route.fromToken.decimals)} {route.fromToken.symbol}
                    </TooltipContent>
                </Tooltip>)}
            </div>
        }
    },
    {
        accessorKey: "routes",
        header: "Output",
        cell: ({ row }) => {
            const routes = row.getValue("routes") as Route[]
            const sum = routes.reduce((acc, route) => acc + BigInt(route.toAmount), BigInt(0))
            return <div className="flex flex-row gap-1">
                <Tooltip>
                    <TooltipTrigger>
                        <img src={routes[0].toToken.logoURI} alt={routes[0].toToken.symbol} className="w-4 h-4 rounded-full" />
                    </TooltipTrigger>
                    <TooltipContent>
                        {formatUnits(sum, routes[0].toToken.decimals)} {routes[0].toToken.symbol}
                    </TooltipContent>
                </Tooltip>
            </div>
        }
    },
    {
        header: "Actions",
        cell: ({ row }) => {
            return <TxActions row={row} />
        }
    }
]