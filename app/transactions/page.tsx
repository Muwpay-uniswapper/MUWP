import Transactions from "@/components/transactions/transactions";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: 'MUWP Pay - Transactions',
    description: 'See your past transactions with MUWP Pay.'
}

export default function TransactionsPage() {
    return (
        <main className="flex flex-col items-center py-2 mt-8">
            <Transactions />
        </main>
    )
}