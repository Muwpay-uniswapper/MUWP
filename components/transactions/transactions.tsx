"use client";
import { useRouteStore } from "@/lib/front/data/routeStore";
import { DataTable } from "../networks/data-table";
import { columns } from "./columns";
import useSWR from "swr"
import { useEffect, useMemo } from "react";

const fetcher = (args: string[]) => fetch(args[0], {
    method: "POST",
    body: JSON.stringify(args[1])
}).then((res) => res.json())

export default function Transactions() {
    const { transactions, setTransaction } = useRouteStore();
    const { data } = useSWR(["/api/status", transactions.map((tx) => tx.id)], fetcher, {
        refreshInterval: 5000,
    })

    const txn = useMemo(() => {
        const _txn = transactions
        for (let i = 0; i < transactions.length; i++) {
            const transaction = transactions[i];
            const l = data ? typeof data[transaction.id] == "string" ? 0 : data[transaction.id].length : 0
            if (data && data[transaction.id] && l !== (transaction.status ?? 0)) {
                _txn[i].status = l
                setTransaction(_txn[i])
            }
        }
        return _txn
    }, [Object.values(data ?? {})])

    return <div className="w-full px-4 max-w-4xl">
        <div className="text-2xl py-4">Pending Transactions</div>
        <DataTable
            columns={columns}
            data={txn.filter((tx) => tx.status < tx.routes.length)}
            sorting={[{
                id: "timestamp",
                desc: true,
            }]}
        />
        <div className="text-2xl py-4">Past Transactions</div>
        <DataTable
            columns={columns}
            data={txn.filter((tx) => tx.status >= tx.routes.length)}
            sorting={[{
                id: "timestamp",
                desc: true,
            }]}
        />
    </div>
}