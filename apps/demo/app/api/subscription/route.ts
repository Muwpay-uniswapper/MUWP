import { NextRequest, NextResponse } from "next/server";
import { resolveNetwork, resolveService } from "@/app/lib/stellar";

export async function POST(req: NextRequest) {
  const { token, recipient, amount, intervalSeconds } = await req.json();

  const secret = process.env.STELLAR_SECRET;
  const contractId = process.env.CONTRACT_ID;

  if (!secret || !contractId) {
    return NextResponse.json(
      { error: "STELLAR_SECRET and CONTRACT_ID must be set in .env" },
      { status: 500 }
    );
  }

  if (!token || !recipient || !amount || !intervalSeconds) {
    return NextResponse.json(
      { error: "Missing required fields: token, recipient, amount, intervalSeconds" },
      { status: 400 }
    );
  }

  try {
    const network = resolveNetwork();
    const service = resolveService();
    const subscriptionId = await service.createSubscription({
      contractId,
      callerSecret: secret,
      token,
      recipient,
      amount: BigInt(amount),
      intervalSeconds: Number(intervalSeconds),
    });
    return NextResponse.json({
      subscriptionId,
      explorerUrl: `${network.explorer}/${contractId}`,
      network: process.env.STELLAR_NETWORK ?? "mainnet",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
