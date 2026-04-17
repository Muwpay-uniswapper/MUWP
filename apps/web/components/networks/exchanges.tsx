"use client";

import { Exchange } from "@muwp/lifi-client";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useSwapStore } from "@/lib/core/data/swapStore";

export function ExchangesList({
    data
}: {
    data: Exchange[]
}) {
    const { allowDenyExchanges } = useSwapStore()
    const selected = Object.fromEntries(data.map((key, index) => [index, !allowDenyExchanges.deny?.includes(key.key!)]))

    return <DataTable
        columns={columns}
        data={data ?? []}
        rowSelection={selected}
    />
}