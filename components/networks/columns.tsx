import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "../ui/checkbox"
import { Exchange } from "@/lib/li.fi-ts"
import { ChainIcon } from "connectkit"

export const columns: ColumnDef<Exchange>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "icon",
        header: () => null,
        cell: ({ row }) => (
            <img
                src={row.original.logoURI}
                alt={row.getValue("name")}
                className="w-6 h-6 rounded-full"
            />
        ),
    },
    {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
            <div className="capitalize">{row.getValue("name")}</div>
        ),
    },
    {
        accessorKey: "supportedChains",
        header: "Supported Chains",
        cell: ({ row }) => (
            <div className="flex flex-row gap-1">
                {row.original.supportedChains?.map((chain) => (
                    <ChainIcon id={chain} key={chain} />
                ))}
            </div>
        ),
    }
]