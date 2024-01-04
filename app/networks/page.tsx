import { Networks as NetworkClient } from "@/components/networks/networks";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: 'MUWP Pay - Networks',
	description: 'Select the bridges and DEXs that you want to use with MUWP Pay.'
}

export default function Networks() {
	return (
		<main className="flex flex-col items-center py-2 mt-8">
			<NetworkClient />
		</main >
	)
}
