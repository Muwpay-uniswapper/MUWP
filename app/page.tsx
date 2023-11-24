import { MainFlow } from "@/components/flow/MainFlow";
import { SwapCard } from "@/components/swapcard";

export default function Home({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
	const chain = typeof searchParams["chain"] === "string" ? searchParams["chain"] : "1";
	const toChain = typeof searchParams["toChain"] === "string" ? searchParams["toChain"] : chain;
	return (
		<main className="flex flex-col items-center py-2 mt-8">
			<div className="flex flex-col md:flex-row gap-2 max-w-screen-xl w-full mx-4">
				<SwapCard chain={chain} toChain={toChain} />
				<div className="flex flex-col justify-center items-center md:w-8/12 mx-4">
					<MainFlow />
				</div>
			</div>
		</main >
	)
}
