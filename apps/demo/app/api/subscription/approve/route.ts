import { NextRequest, NextResponse } from "next/server";
import { resolveNetwork } from "@/app/lib/stellar";
import {
  Keypair,
  TransactionBuilder,
  Contract,
  nativeToScVal,
  Address,
  rpc as SorobanRpc,
  BASE_FEE,
} from "@stellar/stellar-sdk";

export async function POST(req: NextRequest) {
  const { token, amount } = await req.json();
  const secret = process.env.STELLAR_SECRET;
  const contractId = process.env.CONTRACT_ID;

  if (!secret || !contractId) {
    return NextResponse.json(
      { error: "STELLAR_SECRET and CONTRACT_ID must be set in .env" },
      { status: 500 }
    );
  }
  if (!token || !amount) {
    return NextResponse.json({ error: "Missing required fields: token, amount" }, { status: 400 });
  }

  try {
    const network = resolveNetwork();
    const sorobanUrl = process.env.SOROBAN_RPC_URL ?? network.sorobanRpc;
    const server = new SorobanRpc.Server(sorobanUrl);
    const keypair = Keypair.fromSecret(secret);

    const account = await server.getAccount(keypair.publicKey());
    const latestLedger = await server.getLatestLedger();
    const expirationLedger = latestLedger.sequence + 535680; // ~30 days

    const tokenContract = new Contract(token);
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: network.passphrase,
    })
      .addOperation(
        tokenContract.call(
          "approve",
          new Address(keypair.publicKey()).toScVal(),
          new Address(contractId).toScVal(),
          nativeToScVal(BigInt(amount), { type: "i128" }),
          nativeToScVal(expirationLedger, { type: "u32" }),
        )
      )
      .setTimeout(30)
      .build();

    const prepared = await server.prepareTransaction(tx);
    prepared.sign(keypair);

    const result = await server.sendTransaction(prepared);
    if (result.status === "ERROR") {
      throw new Error(`Transaction failed: ${JSON.stringify(result.errorResult)}`);
    }

    return NextResponse.json({
      txHash: result.hash,
      network: process.env.STELLAR_NETWORK ?? "mainnet",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
