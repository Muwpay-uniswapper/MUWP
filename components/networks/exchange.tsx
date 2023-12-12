"use client";

import api from '@/lib/front/data/api';
import useSWR from 'swr'
import { DataTable } from './data-table';
import { columns } from './columns';

export function ExchangesList() {
    const { data, error } = useSWR("tools", () => {
        return api.toolsGet()
    });

    if (error) return <div>failed to load</div>
    if (!data) return <div>loading...</div>

    return <DataTable columns={columns} data={data.exchanges ?? []} />
}