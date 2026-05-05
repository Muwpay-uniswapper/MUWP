# @muwp/sdk Demo

Live demonstration of [`@muwp/sdk`](https://npmjs.com/package/@muwp/sdk) on Stellar mainnet.

## What it shows

- **Soroban Subscription** — create an on-chain recurring payment via the MUWP Soroban contract
- **EVM → XLM Quote** — fetch cross-chain swap routes from the MUWP API

## Signing model

Transactions are signed server-side using `STELLAR_SECRET` from `.env`. This is the **backend signing pattern**: a server holds a key (in production, from a vault like AWS Secrets Manager or HashiCorp Vault) and signs on behalf of the application. For a user-facing app, replace this with [Freighter](https://freighter.app/) wallet integration.

## Quickstart

```bash
git clone https://github.com/muwpay/muwp
cd apps/demo
cp .env.example .env
# Fill in STELLAR_SECRET and MAINNET_CONTRACT_ID in .env
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable | Description |
|----------|-------------|
| `STELLAR_SECRET` | Stellar mainnet secret key (S...) for signing Soroban transactions |
| `MAINNET_CONTRACT_ID` | MUWP Soroban subscription contract ID on mainnet |
| `SOROBAN_RPC_URL` | Soroban RPC endpoint (default: `https://soroban-rpc.stellar.org`) |
| `MUWP_BASE_URL` | MUWP API URL (default: `https://muwp.xyz`) |

## SDK version

This demo uses `@muwp/sdk@1.0.0`. See the [SDK docs](https://muwp.xyz/docs/sdk/) for full API reference.
