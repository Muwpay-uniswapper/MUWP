import { Networks as NetworkClient } from "@/components/networks/networks";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: 'MUWPay - Networks',
	description: 'Select the bridges and DEXs that you want to use with MUWPay.'
}

export default function Networks() {
	return (
		<main className="flex flex-col items-center py-2 mt-8">
			<NetworkClient />
		</main >
	)
}
