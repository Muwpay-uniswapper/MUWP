/**
 * Example 04 — Soroban Subscription Workflow (offline-friendly)
 *
 * Demonstrates the full subscription lifecycle: create → read → trigger → cancel
 * Runs against Stellar testnet. Network errors are caught gracefully.
 *
 * To run with real testnet keys:
 *   SUBSCRIBER_SECRET=S... RECIPIENT=G... CONTRACT_ID=C... bun run examples/04-soroban-subscription.ts
 */
import { Keypair, Networks } from "@stellar/stellar-sdk";
import { SorobanSubscriptionService } from "../src/services/SorobanSubscriptionService";

const SOROBAN_URL = process.env.SOROBAN_URL ?? "https://soroban-testnet.stellar.org";
const SUBSCRIBER_SECRET = process.env.SUBSCRIBER_SECRET ?? Keypair.random().secret();
const RECIPIENT = process.env.RECIPIENT ?? Keypair.random().publicKey();
// Default token: native XLM Stellar Asset Contract on Stellar testnet.
const TOKEN = process.env.TOKEN ?? "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";
// Default contract: MUWP subscription contract deployed on Stellar testnet.
const CONTRACT_ID = process.env.CONTRACT_ID ?? "CBOKTWNHNLCC253HVHAXR2557RRNA2RA6SNGRFFIVVB2WHTWCEBUAKJX";

async function main() {
  const service = new SorobanSubscriptionService({
    sorobanUrl: SOROBAN_URL,
    networkPassphrase: Networks.TESTNET,
  });

  console.log("=== MUWP Soroban Subscription Example ===\n");
  console.log(`Soroban RPC : ${SOROBAN_URL}`);
  console.log(`Contract    : ${CONTRACT_ID}`);
  console.log(`Subscriber  : ${Keypair.fromSecret(SUBSCRIBER_SECRET).publicKey()}`);
  console.log(`Recipient   : ${RECIPIENT}`);
  console.log(`Token       : ${TOKEN}\n`);

  let subscriptionId = 1;

  // Step 1: Create
  console.log("1. Creating subscription (10 tokens / 3600s)…");
  try {
    subscriptionId = await service.createSubscription({
      contractId: CONTRACT_ID,
      callerSecret: SUBSCRIBER_SECRET,
      token: TOKEN,
      recipient: RECIPIENT,
      amount: 10_000_000n,
      intervalSeconds: 3600,
    });
    console.log(`   ✓ Subscription created — id: ${subscriptionId}\n`);
  } catch (e) {
    console.log(`   ✗ ${(e as Error).message} (expected in offline demo)\n`);
  }

  // Step 2: Read
  console.log(`2. Reading subscription #${subscriptionId}…`);
  try {
    const sub = await service.getSubscription(CONTRACT_ID, subscriptionId);
    console.log("   ✓ Subscription:", JSON.stringify({
      active: sub.active,
      amount: sub.amount.toString(),
      intervalSeconds: sub.interval,
      nextPayment: new Date(sub.nextPayment * 1000).toISOString(),
    }, null, 4), "\n");
  } catch (e) {
    console.log(`   ✗ ${(e as Error).message} (expected in offline demo)\n`);
  }

  // Step 3: Trigger
  console.log(`3. Triggering payment for subscription #${subscriptionId}…`);
  try {
    const hash = await service.triggerPayment({
      contractId: CONTRACT_ID,
      callerSecret: SUBSCRIBER_SECRET,
      subscriptionId,
    });
    console.log(`   ✓ Payment triggered — tx hash: ${hash}\n`);
  } catch (e) {
    console.log(`   ✗ ${(e as Error).message} (expected in offline demo)\n`);
  }

  // Step 4: Cancel
  console.log(`4. Cancelling subscription #${subscriptionId}…`);
  try {
    const hash = await service.cancelSubscription({
      contractId: CONTRACT_ID,
      subscriberSecret: SUBSCRIBER_SECRET,
      subscriptionId,
    });
    console.log(`   ✓ Subscription cancelled — tx hash: ${hash}\n`);
  } catch (e) {
    console.log(`   ✗ ${(e as Error).message} (expected in offline demo)\n`);
  }

  console.log("Done. Set SUBSCRIBER_SECRET, CONTRACT_ID env vars to run on testnet.");
}

main().catch(console.error);
