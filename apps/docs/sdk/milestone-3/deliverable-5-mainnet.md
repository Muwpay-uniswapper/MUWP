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
| GitHub | [Muwpay-uniswapper/MUWP](https://github.com/Muwpay-uniswapper/MUWP) |
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
| Contract ID | [`CC76NWELMDVXHFU7T62KJQ2UI6EPHPVG25C65EIIP7R6CPEFITTDZXPA`](https://stellar.expert/explorer/public/contract/CC76NWELMDVXHFU7T62KJQ2UI6EPHPVG25C65EIIP7R6CPEFITTDZXPA) |
| WASM hash | `5f72dd9ce62f3c7e3f7c21d428c5a1e7284edbbdeae9a7ec3e3727a6b98ef285` |
| Upload tx | [`296ae51ee67543048f2b5714788f41004194fab25308860ef84742185b35c568`](https://stellar.expert/explorer/public/tx/296ae51ee67543048f2b5714788f41004194fab25308860ef84742185b35c568) |
| Deploy tx | [`b61cf3e19dc05c03c6279815b077fb62a23e5d5ce24e8dd4bace9a7aabfbd5ed`](https://stellar.expert/explorer/public/tx/b61cf3e19dc05c03c6279815b077fb62a23e5d5ce24e8dd4bace9a7aabfbd5ed) |

---

## Mainnet Lifecycle Validation

**Contract:** [`CC76NWELMDVXHFU7T62KJQ2UI6EPHPVG25C65EIIP7R6CPEFITTDZXPA`](https://stellar.expert/explorer/public/contract/CC76NWELMDVXHFU7T62KJQ2UI6EPHPVG25C65EIIP7R6CPEFITTDZXPA)  
**Token:** XLM native SAC (`CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA`)

| Action | Result | Tx hash |
|--------|--------|---------|
| `create` | subscription ID `2` created | _(no on-chain hash — contract call via RPC)_ |
| `get` | active: `true`, amount `100000` stroops, interval `60s` | _(read-only)_ |
| `approve` | allowance granted to contract | [`d0642b9e...`](https://stellar.expert/explorer/public/tx/d0642b9e582deb3e85763a4b6ed8b03e4705fe3a4806b70fd83e975bb8ef581b) |
| `trigger` | payment transferred on-chain | [`3fd4f6f7...`](https://stellar.expert/explorer/public/tx/3fd4f6f75b45ed47e4989a4f416e2be5003bae84733cb49c837c20d565a995da) |
| `cancel` | subscription marked inactive | [`abc1850c...`](https://stellar.expert/explorer/public/tx/abc1850c899163cfca254c40507e59610aefdfe920a068ef6d0d34815edac2db) |

---

## Testnet → Mainnet Migration Guide

Three config changes are required:

```ts
// Testnet
const service = new SorobanSubscriptionService({
  sorobanUrl: "https://soroban-rpc.stellar.org/testnet",
  networkPassphrase: Networks.TESTNET,
});
await service.createSubscription({
  contractId: "CAH3T7NSZMZTX2KPKK5IKKMCKE4ZDYVK4OO64OISB6OY7W3OLS6OJJMP",
  // ...
});

// Mainnet
const service = new SorobanSubscriptionService({
  sorobanUrl: "https://soroban-rpc.stellar.org",
  // networkPassphrase defaults to Networks.PUBLIC in v1.0.0
});
await service.createSubscription({
  contractId: "CC76NWELMDVXHFU7T62KJQ2UI6EPHPVG25C65EIIP7R6CPEFITTDZXPA",
  // ...
});
```

---

## Live Demo

A standalone Next.js demo app is available in [`apps/demo/`](https://github.com/muwpay):

```bash
git clone https://github.com/muwpay/muwp
cd apps/demo
cp .env.example .env   # fill in your keys
bun install
bun dev
```

