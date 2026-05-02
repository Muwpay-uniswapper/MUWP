# Deliverable 3 — Soroban Smart Contract Integration

**Status:** Complete  
**Branch:** `main`

---

## Grant Requirements

> Functional APIs for subscription workflows using Soroban contracts. Comprehensive documentation and example integrations.

---

## Smart Contract

**Source:** `contracts/soroban/src/lib.rs`  
**Testnet Contract ID:** [`CBOKTWNHNLCC253HVHAXR2557RRNA2RA6SNGRFFIVVB2WHTWCEBUAKJX`](https://stellar.expert/explorer/testnet/contract/CBOKTWNHNLCC253HVHAXR2557RRNA2RA6SNGRFFIVVB2WHTWCEBUAKJX)  
**WASM hash:** `e28c6ce23f7bfb87dc99675324ceeef52e8589e76c2330dbb4fcc26449e3b1c5` (5693 bytes)  
**Network:** Stellar Testnet  
**Soroban SDK:** `22.0`  
**Build:** `wasm32v1-none` (stellar-cli 26.0)

### Deployment proofs

| Step | Tx hash | Link |
|---|---|---|
| Upload WASM | `db5540fd7730bd9e95bbe379590adf179c5b2c174e5066310365aaece94f5df7` | [stellar.expert](https://stellar.expert/explorer/testnet/tx/db5540fd7730bd9e95bbe379590adf179c5b2c174e5066310365aaece94f5df7) |
| Deploy contract | `181df65325e9594de71319f7be4eded851b9650fa263019343c262d6c74e7842` | [stellar.expert](https://stellar.expert/explorer/testnet/tx/181df65325e9594de71319f7be4eded851b9650fa263019343c262d6c74e7842) |

### End-to-end testnet lifecycle (proven on-chain)

| Action | Subscription state | Tx hash |
|---|---|---|
| `create` (subscriber, XLM SAC, recipient, 1 XLM, 60s) | id `1`, `active=true` | [`65ea6245…`](https://stellar.expert/explorer/testnet/tx/65ea62458a143de081049b5b8a411f204681ab4df4d08dc600d6f03e73dc9963) |
| `approve` (XLM SAC → contract, 100 XLM) | allowance set | [`1d21c431…`](https://stellar.expert/explorer/testnet/tx/1d21c431d7e3dd02167c181708117033e199d7f30d63741f69ed6e17a4329ccf) |
| `trigger` (after 60s) | **transfer 1 XLM emitted** | [`d61e1155…`](https://stellar.expert/explorer/testnet/tx/d61e1155f6bcb41b402cb694d59984bf3dee02eb01c846b70e116eddab81eb3b) |
| `cancel` | `active=false` | [`8b7583b3…`](https://stellar.expert/explorer/testnet/tx/8b7583b3ac6505f943cdaac6a3c68f258e9a47855a3968227a29d6d4bea45ee1) |

The `trigger` transaction emitted a real `transfer` event from the XLM SAC: subscriber → recipient, amount `10000000` stroops (= 1 XLM), pulled by the contract via `transfer_from`.

**Subscriber account:** `GBZCJYXOJ5U26Q5PCZJ3G5VBBRUHU7ZPMY3JCXGSCFF4WZQYS46ZKNVD`  
**Recipient account:** `GBYTXEWYKEYSCJEYCRO7P7WPZSWNWLOS7LNXBPA3Q7USHHRQW2ZERQY3`  
**Token (native XLM SAC):** `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`

### Contract interface

| Function | Arguments | Returns |
|---|---|---|
| `create(subscriber, token, recipient, amount, interval)` | Addresses + i128 + u64 | `u64` (subscription id) |
| `trigger(id)` | `u64` | — |
| `cancel(id)` | `u64` | — |
| `get(id)` | `u64` | `Subscription` struct |

### Subscription struct

```rust
pub struct Subscription {
    pub subscriber: Address,
    pub token: Address,
    pub recipient: Address,
    pub amount: i128,
    pub interval: u64,     // seconds between payments
    pub next_payment: u64, // Unix timestamp
    pub active: bool,
}
```

### Payment flow

The contract uses the `transfer_from` pattern: the subscriber must first call `token.approve(contract_address, amount)` to authorize the contract to pull tokens. `trigger()` can then be called by anyone once the payment date is reached.

### Embedded Rust tests

```bash
cd contracts/soroban && cargo test
```

```
test tests::test_create_returns_id ... ok
test tests::test_get_subscription ... ok
test tests::test_cancel_subscription ... ok
test tests::test_trigger_after_interval ... ok

test result: ok. 4 passed; 0 failed
```

---

## SDK Service

**File:** `packages/sdk/src/services/SorobanSubscriptionService.ts`

```typescript
import { SorobanSubscriptionService } from "@muwp/sdk";
import { Networks } from "@stellar/stellar-sdk";

const service = new SorobanSubscriptionService({
  sorobanUrl: "https://soroban-testnet.stellar.org",
  networkPassphrase: Networks.TESTNET,
});

// Create a recurring subscription: 10 USDC every hour
const id = await service.createSubscription({
  contractId: "C...",
  callerSecret: "S...",
  token: "CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA",
  recipient: "G...",
  amount: 10_000_000n,   // 10 tokens with 6 decimals
  intervalSeconds: 3600,
});

// Trigger the payment when due
const txHash = await service.triggerPayment({
  contractId: "C...",
  callerSecret: "S...",
  subscriptionId: id,
});

// Cancel the subscription
await service.cancelSubscription({
  contractId: "C...",
  subscriberSecret: "S...",
  subscriptionId: id,
});

// Read a subscription
const sub = await service.getSubscription("C...", id);
console.log(sub.active, sub.nextPayment);
```

### Methods

| Method | Parameters | Returns |
|---|---|---|
| `createSubscription(params)` | `CreateSubscriptionParams` | `Promise<number>` (id) |
| `triggerPayment(params)` | `TriggerPaymentParams` | `Promise<string>` (tx hash) |
| `cancelSubscription(params)` | `CancelSubscriptionParams` | `Promise<string>` (tx hash) |
| `getSubscription(contractId, id)` | `string, number` | `Promise<Subscription>` |

---

## Tests

**File:** `packages/sdk/tests/subscription.spec.ts`

```
✓ createSubscription: calls sendTransaction and returns a subscription id
✓ createSubscription: throws when simulation returns an error
✓ cancelSubscription: sends a cancel transaction and returns the hash
✓ triggerPayment: sends a trigger transaction and returns the hash
```

```bash
cd packages/sdk && bun run test tests/subscription.spec.ts
```

---

## Example

**File:** `packages/sdk/examples/04-soroban-subscription.ts`

```bash
cd packages/sdk

# Offline mode (demo — every step prints an expected network error)
bun run examples/04-soroban-subscription.ts

# With real testnet keys
SUBSCRIBER_SECRET=S... CONTRACT_ID=C... bun run examples/04-soroban-subscription.ts
```

---

## File layout

```
contracts/soroban/
├── Cargo.toml
└── src/lib.rs                         ← Soroban contract (Rust)

packages/sdk/
├── src/
│   ├── services/
│   │   └── SorobanSubscriptionService.ts   ← SDK service
│   └── types/
│       └── subscription.ts                 ← Types + Zod schemas
├── tests/
│   └── subscription.spec.ts               ← 4 unit tests
└── examples/
    └── 04-soroban-subscription.ts         ← End-to-end example
```
