"use client";
import { useRouteStore } from "@/lib/front/data/routeStore";
import { DataTable } from "../networks/data-table";
import { columns } from "./columns";

export default function Transactions() {
    const { transactions } = useRouteStore();

    return <DataTable
        columns={columns}
        data={transactions}
    />
}