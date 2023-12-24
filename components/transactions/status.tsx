import { Transaction } from "@/lib/front/data/routeStore"
import { Row } from "@tanstack/react-table"
import { useState } from "react"
import useSWR from "swr"
import { Route } from "@/lib/li.fi-ts";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { LoaderIcon } from "lucide-react";
import { Separator } from "../ui/separator";

const fetcher = (args: string[]) => fetch(args[0], {
    method: "POST",
    body: args[1]
}).then((res) => res.json())

export default function Status({ row }: { row: Row<Transaction> }) {
    const routes = row.getValue("routes") as Route[]
    const id = row.getValue("id") as string
    const { data } = useSWR(["/api/status", id], fetcher, {
        refreshInterval: 5000,
    })

    return <Tooltip>
        <TooltipTrigger>
            <div className={`capitalize relative ${row.getValue("status")}`}>
                {((data as string[])?.length ?? 0) < routes.length &&
                    <LoaderIcon className="animate-spin w-4 h-4 inline absolute -left-5" />
                }
                {(data as string[])?.length ?? 0} / {routes.length}
            </div>
        </TooltipTrigger>
        <TooltipContent>
            <p className="text-sm max-w-sm">
                This transaction has {routes.length} steps. {((data as string[])?.length ?? 0) < routes.length && <span>Some of them are still pending...<br /><br /><Separator /><br /> If this is taking too long (way more than expected), you can recover your funds or contact support.</span>}

            </p>
        </TooltipContent>
    </Tooltip>
}