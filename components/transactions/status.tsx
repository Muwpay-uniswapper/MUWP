import { Transaction } from "@/lib/front/data/routeStore"
import { Row } from "@tanstack/react-table"
import { Route } from "@/lib/li.fi-ts";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { AlertTriangle, LoaderIcon } from "lucide-react";

export default function Status({ row }: { row: Row<Transaction> }) {
    const routes = row.getValue("routes") as Route[]
    let duration = routes.map((route) => route.steps.map((step) => step.estimate?.executionDuration ?? 0).reduce((a, b) => a + b, 0)).reduce((a, b) => Math.max(a, b), 0); // Steps are executed in parallel, so we take the max
    if (duration > 0) {
        duration += 3 * 60; // Add 3 min for the transaction to be mined
    }
    const diff = new Date().getTime() - new Date(row.original.timestamp).getTime()

    return <Tooltip>
        <TooltipTrigger>
            <div className={`capitalize relative ${row.getValue("status")}`}>
                {
                    (diff > (2 * duration)) && (row.original.status ?? 0) < routes.length && <AlertTriangle className="w-4 h-4 inline absolute -left-5" />
                }
                {(row.original.status ?? 0) < routes.length && diff <= (2 * duration) &&
                    <LoaderIcon className="animate-spin w-4 h-4 inline absolute -left-5" />
                }
                {row.original.status ?? 0} / {routes.length}
            </div>
        </TooltipTrigger>
        <TooltipContent>
            <p className="text-sm max-w-sm">
                This transaction has {routes.length} steps. {(row.original.status ?? 0) < routes.length && diff <= (2 * duration) ? <span>Some of them are still pending...</span> : <span>If this is taking too long (way more than expected), you can recover your funds or contact support.</span>}
            </p>
        </TooltipContent>
    </Tooltip>
}