import { NextRequest, NextResponse } from "next/server";
import { resolveService } from "@/app/lib/stellar";

export async function POST(req: NextRequest) {
  const { subscriptionId } = await req.json();
  const contractId = process.env.CONTRACT_ID;

  if (!contractId) {
    return NextResponse.json({ error: "CONTRACT_ID must be set in .env" }, { status: 500 });
  }
  if (!subscriptionId) {
    return NextResponse.json({ error: "Missing required field: subscriptionId" }, { status: 400 });
  }

  try {
    const service = resolveService();
    const subscription = await service.getSubscription(contractId, Number(subscriptionId));
    return NextResponse.json({
      ...subscription,
      amount: subscription.amount.toString(),
      network: process.env.STELLAR_NETWORK ?? "mainnet",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
