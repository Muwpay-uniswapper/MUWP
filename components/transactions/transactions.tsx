"use client";
import { useRouteStore } from "@/lib/core/data/routeStore";
import { DataTable } from "../networks/data-table";
import { columns } from "./columns";
import useSWR from "swr"
import { useMemo } from "react";

const fetcher = (args: string[]) => {
    return fetch(args[0], {
        method: "POST",
        body: JSON.stringify(args[1])
    }).then((res) => res.json())
}

export default function Transactions() {
    const { transactions } = useRouteStore();
    const { data } = useSWR(["/api/status", transactions.map((tx) => tx.id)], fetcher, {
        refreshInterval: 5000,
    })

    const txn = useMemo(() => {
        if (!data) return transactions
        const _txn = transactions
        for (let i = 0; i < transactions.length; i++) {
            const transaction = transactions[i];
            const l = data ? typeof data[transaction.id] == "string" ? 0 : data[transaction.id] as any : 0
            if (data && data[transaction.id] && (typeof l == "number" || typeof l == "object")) {
                _txn[i].status = {
                    completed: typeof l == "number" ? l : l.completed?.length,
                    errors: typeof l == "number" ? undefined : l.errors,
                }
            }
        }
        console.log(_txn, data)
        return _txn
    }, [data, Object.values(data ?? {})])

    return <div className="w-full px-4 max-w-6xl">
        <div className="text-2xl py-4">Pending Transactions</div>
        <DataTable
            columns={columns}
            data={txn.filter((tx) => (tx.status.completed ?? 0) < tx.routes.length)}
            sorting={[{
                id: "timestamp",
                desc: true,
            }]}
        />
        <div className="text-2xl pt-4">Past Transactions</div>
        <p className="text-gray-500 pb-4 text-sm">Some cross-chain transactions may take a few minutes to complete. Please wait for the transaction to be confirmed on the destination chain.</p>
        <DataTable
            columns={columns}
            data={txn.filter((tx) => tx.status.completed >= tx.routes.length)}
            sorting={[{
                id: "timestamp",
                desc: true,
            }]}
        />
    </div>
}