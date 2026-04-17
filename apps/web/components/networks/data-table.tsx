"use client"

import {
    ColumnDef,
    OnChangeFn,
    RowSelectionState,
    SortingState,
    TableOptions,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import React from "react"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    sorting?: SortingState
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
    sorting: _sorting = [],
    rowSelection,
    onRowSelectionChange,
}: DataTableProps<TData, TValue> & {
    rowSelection?: RowSelectionState,
    onRowSelectionChange?: OnChangeFn<RowSelectionState>
}) {
    const [sorting, setSorting] = React.useState<SortingState>(_sorting)

    const input = {
        data,
        columns,
        enableRowSelection: true,
        state: {
            sorting
        },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onRowSelectionChange,
        getCoreRowModel: getCoreRowModel(),
    } as TableOptions<TData>
    if (rowSelection && input.state) {
        input.state.rowSelection = rowSelection
    }
    const table = useReactTable(input)

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => {
                                return (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                )
                            })}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && "selected"}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
