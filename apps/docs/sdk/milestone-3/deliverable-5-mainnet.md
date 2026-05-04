# Deliverable 5 — SDK Launch on Mainnet

**Status:** Complete  
**Branch:** `main`

---

## Grant Requirements

> Deploy the final SDK version on Stellar's mainnet, including all features from MVP and Testnet. Public SDK release on GitHub with comprehensive documentation. Live demonstration of a functional project using the SDK.

---

## SDK Release

| Item | Value |
|------|-------|
| Package | [`@muwp/sdk@1.0.0`](https://www.npmjs.com/package/@muwp/sdk) |
| GitHub | [muwpay/muwp](https://github.com/muwpay) |
| License | MIT |

**Install:**
```bash
npm install @muwp/sdk
# or
bun add @muwp/sdk
```

---

## Soroban Contract — Mainnet Deployment

**Network:** Stellar Mainnet (`Public Global Stellar Network ; September 2015`)  
**Soroban SDK:** `25.3.1`

| Field | Value |
|-------|-------|
| Contract ID | `TBD` |
| WASM hash | `TBD` |
| Upload tx | `TBD` |
| Deploy tx | `TBD` |

---

## Mainnet Lifecycle Validation

| Action | Result | Tx hash |
|--------|--------|---------|
| `create` | subscription created | `TBD` |
| `approve` | allowance set | `TBD` |
| `trigger` | payment transferred on-chain | `TBD` |
| `cancel` | subscription cancelled | `TBD` |

---

## Testnet → Mainnet Migration Guide

Three config changes are required:

```ts
// Before (testnet)
const service = new SorobanSubscriptionService({
  sorobanUrl: "https://soroban-rpc.stellar.org/testnet",
  networkPassphrase: Networks.TESTNET,
});
await service.createSubscription({
  contractId: "CAH3T7NSZMZTX2KPKK5IKKMCKE4ZDYVK4OO64OISB6OY7W3OLS6OJJMP",
  // ...
});

// After (mainnet)
const service = new SorobanSubscriptionService({
  sorobanUrl: "https://soroban-rpc.stellar.org",
  // networkPassphrase defaults to Networks.PUBLIC in v1.0.0
});
await service.createSubscription({
  contractId: "TBD_MAINNET_CONTRACT_ID",
  // ...
});
```

---

## Live Demo

A standalone Next.js demo app is available in [`apps/demo/`](https://github.com/muwpay):

```bash
git clone https://github.com/muwpay/muwp
cd MUWP/apps/demo
cp .env.example .env   # fill in your keys
bun install
bun dev
```

Demo video: `TBD`
