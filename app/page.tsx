import { SwapCard } from "@/components/swapcard";

export default function Home() {
	return (
		<main className="flex flex-col items-center py-2 mt-8">
			<div className="flex flex-col md:flex-row max-w-screen-xl w-full">
				<SwapCard />
				<div className="flex flex-col justify-center items-center md:w-8/12">
					World
				</div>
			</div>
		</main >
	)
}
