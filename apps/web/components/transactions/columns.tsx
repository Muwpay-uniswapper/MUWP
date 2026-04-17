"use client";

import { Transaction } from "@/lib/core/data/routeStore";
import { ColumnDef, Row } from "@tanstack/react-table"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Route } from "@lifi/sdk";
import { formatUnits } from "viem";
import TxActions from "./txActions";
import Status from "./status";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { AptosChainId } from "@/lib/layerzero/aptos/omnichains";
import { ClaimAptos } from "@/lib/layerzero/aptos/claim";
import { muwpChains } from "@/muwp";


export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "timestamp",
        sortingFn: (rowA: Row<Transaction>, rowB: Row<Transaction>, _columnId: string): number => {
            const a = new Date(rowA.original.timestamp)
            const b = new Date(rowB.original.timestamp)
            return a > b ? 1 : a < b ? -1 : 0
        },
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.original.timestamp)
            return date.toLocaleString()
        }
    },
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => {
            const id = row.getValue("id") as string
            const chainId = row.original.routes[0].fromChainId

            const chain = muwpChains.find((chain) => chain.id === chainId)

            const shorthash = `${id.slice(0, 6)}...${id.slice(-4)}`
            return <Tooltip>
                <TooltipTrigger>{shorthash}</TooltipTrigger>
                <TooltipContent>
                    <a href={`${chain?.blockExplorers?.default.url}/address/${id}`} target="_blank" rel="noreferrer" className="hover:underline font-mono">{id}</a>
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
            const _inputs = new Set(routes.map((route) => route.fromToken.address))
            const inputs = Array.from(_inputs).map((address) => routes.find((route) => route.fromToken.address === address)!.fromToken)
            return <div className="flex flex-row gap-1">
                {Array.from(inputs).map((route) => <Tooltip key={route.address}>
                    <TooltipTrigger>
                        <img src={route?.logoURI} alt={route.symbol} className="w-4 h-4 rounded-full" />
                    </TooltipTrigger>
                    <TooltipContent>
                        {formatUnits(BigInt(
                            routes.filter((r) => r.fromToken === route).reduce((acc, r) => acc + BigInt(r.fromAmount), 0n)
                        ), route.decimals)} {route.symbol}
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
            const _outputs = new Set(routes.map((route) => route.toToken.address))
            const outputs = Array.from(_outputs).map((address) => routes.find((route) => route.toToken.address === address)!.toToken)
            return <div className="flex flex-row gap-1">
                {Array.from(outputs).map((route) => <Tooltip key={route.address}>
                    <TooltipTrigger>
                        <img src={route?.logoURI} alt={route.symbol} className="w-4 h-4 rounded-full" />
                    </TooltipTrigger>
                    <TooltipContent>
                        {formatUnits(BigInt(
                            routes.filter((r) => r.toToken === route).reduce((acc, r) => acc + BigInt(r.toAmount), 0n)
                        ), route.decimals)} {route.symbol}
                    </TooltipContent>
                </Tooltip>)}
            </div>
        }
    },
    {
        accessorKey: "routes",
        header: "",
        cell: ({ row }) => {
            const completed = row.original.status.completed === row.original.routes.length
            if (!completed) return null
            const output = row.getValue("routes") as Route[]
            if (output.some((route) => route.toToken.chainId === AptosChainId as any)) {
                return <ClaimAptos tokensAddress={output.filter((route) => route.toToken.chainId === AptosChainId as any).map((route) => route.toToken.address as `0x${string}`)} />
            }
            return null
        }
    },
    {
        header: "Actions",
        cell: ({ row }) => {
            return <TxActions row={row} />
        }
    }
]