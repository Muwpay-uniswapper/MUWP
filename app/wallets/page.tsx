"use client";
import { Wallets } from "@/components/preview/wallets";
import { Metadata } from 'next'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button";
import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/core/utils";
import { Badge } from "@/components/ui/badge";

export default function WalletsPage() {
    const [open, setOpen] = React.useState(false);
    return (
        <main className="flex flex-col items-center py-2 mt-8">
            <div className="flex flex-col md:flex-row gap-2 max-w-screen-xl w-full mx-4">
                <Dialog open={true}>
                    <DialogContent canClose={!open}>

                        <DialogHeader>
                            <DialogTitle>Trade Review</DialogTitle>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>
        </main >
    )
}
