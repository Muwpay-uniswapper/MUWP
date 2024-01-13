import { MainFlow } from "@/components/flow/MainFlow";
import PreviewProcess from "@/components/preview/process";
import PreviewSwap from "@/components/previewswap";
import { SwapCard } from "@/components/swapcard";
import { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'MUWPay - Universal Swapper',
	description: 'MUWPay helps you swap multiple tokens across multiple chains, in a single transaction.'
}

export default function Home({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
	const chain = typeof searchParams["chain"] === "string" ? searchParams["chain"] : "1";
	const toChain = searchParams["toChain"] as string | undefined;
	return (
		<main className="flex flex-col items-center py-2 mt-8">
			<div className="flex flex-col md:flex-row gap-2 max-w-screen-xl w-full mx-4">
				<SwapCard chain={chain} toChain={toChain} />
				<div className="flex flex-col items-center md:w-8/12 mx-4">
					<MainFlow />
					<PreviewSwap />
					<PreviewProcess />
				</div>
			</div>
		</main >
	)
}
