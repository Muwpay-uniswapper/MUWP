"use client";

import { Transaction } from "@/lib/front/data/routeStore";
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<Transaction>[] = [
    {
        accessorKey: "id",
        header: "ID",
        cell: ({ row }) => (<div>{row.getValue("id")}</div>),
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <div className={`capitalize ${row.getValue("status")}`}>{row.getValue("status")}</div>
        ),
    }
]