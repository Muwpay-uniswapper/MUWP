"use client";
import { WalletAccessor } from "@/components/preview/wallets";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import React from "react";

export default function WalletsPage() {
    const [open, setOpen] = React.useState(false);
    return (
        <main className="flex flex-col items-center py-2 mt-8">
            <div className="flex flex-col md:flex-row gap-2 max-w-screen-xl w-full mx-4">
                <Dialog open={true}>
                    <DialogContent canClose={!open}>
                        <WalletAccessor />
                        <DialogHeader>
                            <DialogTitle>Trade Review</DialogTitle>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>
        </main >
    )
}
