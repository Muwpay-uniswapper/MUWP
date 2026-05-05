import { MuwpSdk } from "@muwp/sdk";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	const { inputTokens, inputAmount, inputChain, distribution } =
		await req.json();

	const sdk = new MuwpSdk({
		baseUrl: process.env.MUWP_BASE_URL ?? "https://muwp.xyz",
	});

	try {
		const quote = await sdk.wallets.fetchQuote({
			inputTokens,
			outputTokens: [
				{
					address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
					value: "usdt",
				},
			],
			distribution: distribution ?? [100],
			inputChain: Number(inputChain),
			outputChain: Number(inputChain),
			inputAmount: inputAmount as unknown as Record<string, bigint>,
			fromAddress: "0x0000000000000000000000000000000000000000",
			toAddress: "0x0000000000000000000000000000000000000001",
		});

		return NextResponse.json({
			tempAccount: quote.tempAccount,
			validUntil:
				quote.validUntil instanceof Date
					? quote.validUntil.toISOString()
					: String(quote.validUntil),
			routeCount: Object.values(quote.routes).flat().length,
			routes: Object.values(quote.routes).flat().slice(0, 3),
		});
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : String(err);
		return NextResponse.json({ error: message }, { status: 500 });
	}
}
