import { Transaction, useRouteStore } from "@/lib/core/data/routeStore"
import { Row } from "@tanstack/react-table"
import { useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { CopyIcon, MoreHorizontal, TrashIcon } from "lucide-react";


export default function TxActions({ row }: { row: Row<Transaction> }) {
    const [pk, setPk] = useState<string | null>(null)
    const { deleteTransaction } = useRouteStore();

    return <>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={async () => {
                    const pk = await fetch(`/api/recover-funds`, {
                        method: "POST",
                        body: row.getValue("id")
                    }).then((res) => res.text())
                    setPk(pk)
                }}>
                    Recover funds
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-red-500"
                    onClick={() => {
                        deleteTransaction(row.original)
                    }}
                >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    Delete
                </DropdownMenuItem>
                {/* <DropdownMenuItem>View customer</DropdownMenuItem>
                <DropdownMenuItem>View payment details</DropdownMenuItem> */}
            </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialog open={pk != null}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Recover Funds</AlertDialogTitle>
                    <AlertDialogDescription className="max-w-full">
                        If the transaction has failed, you can recover the funds by accessing the wallet with the private key below.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="relative max-w-[29rem]">
                    <div className="rounded-lg bg-black p-4 text-white">
                        <div className="overflow-x-auto">
                            {pk}
                        </div>
                    </div>
                    <Button className="absolute top-2 right-2" variant="secondary" onClick={() => {
                        if (!pk) return;
                        navigator.clipboard.writeText(pk)
                        setPk(null)
                    }}>
                        <CopyIcon className="text-white" />
                    </Button>
                </div>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setPk(null)}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog >
    </>
}