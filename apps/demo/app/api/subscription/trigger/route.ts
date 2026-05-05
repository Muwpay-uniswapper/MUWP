import { NextRequest, NextResponse } from "next/server";
import { resolveService } from "@/app/lib/stellar";

export async function POST(req: NextRequest) {
  const { subscriptionId } = await req.json();
  const secret = process.env.STELLAR_SECRET;
  const contractId = process.env.CONTRACT_ID;

  if (!secret || !contractId) {
    return NextResponse.json(
      { error: "STELLAR_SECRET and CONTRACT_ID must be set in .env" },
      { status: 500 }
    );
  }
  if (!subscriptionId) {
    return NextResponse.json({ error: "Missing required field: subscriptionId" }, { status: 400 });
  }

  try {
    const service = resolveService();
    const txHash = await service.triggerPayment({
      contractId,
      callerSecret: secret,
      subscriptionId: Number(subscriptionId),
    });
    return NextResponse.json({
      txHash,
      network: process.env.STELLAR_NETWORK ?? "mainnet",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
