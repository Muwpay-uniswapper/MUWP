# Glossary

## Cross-Chain Concepts

**Bridge**  
A protocol that enables token transfers between different blockchain networks. MUWP uses Allbridge (EVM → Stellar), Hashport (EVM → Hedera), and LayerZero (EVM → Aptos). Bridges lock assets on the source chain and mint equivalent assets on the destination chain.

**Atomic Swap**  
A trustless exchange between users on different blockchains without requiring a central custodian. MUWP approximates this using a server-signed escrow pattern rather than true HTLC atomicity.

**Temp Account**  
A MUWP-managed Stellar keypair created server-side per swap session. Users send EVM tokens to the corresponding smart contract pointing to this account. The account's funds are automatically forwarded to the destination after the bridge completes.

**Route**  
A sequence of bridge/swap steps that moves tokens from source chain/token to destination chain/token. MUWP aggregates routes from multiple providers and returns the best options sorted by output value.

---

## Stellar Concepts

**Horizon API**  
Stellar's HTTP API for querying the network (accounts, balances, orderbooks, transactions) and submitting signed transactions. Used in `StellarAssetService` and `StellarDexService`.

**Transaction Envelope (XDR)**  
The binary format (Base64-encoded XDR) used to represent a Stellar transaction ready for signing and submission. `buildTrustlineTransaction` and `buildIssuanceTransaction` return XDR strings.

**Sequence Number**  
A counter on each Stellar account that increments with every submitted transaction. Prevents replay attacks. `TransactionBuilder` reads and increments it automatically via `loadAccount`.

**Base Fee**  
The minimum Stellar transaction fee — currently 100 stroops (0.00001 XLM). Used as the default fee in SDK transaction builders.

**Trustline**  
An opt-in record that allows a Stellar account to hold a specific non-native asset. Required before receiving bridged tokens. Created by `buildTrustlineTransaction` → `Operation.changeTrust`.

**Issuer Account**  
The Stellar account responsible for creating and managing a custom asset. The issuer's public key forms part of the asset identifier (`ASSETCODE:ISSUER_PUBLIC_KEY`).

**Soroban**  
Stellar's smart contract platform. Contracts are written in Rust (compiled to WASM) and executed on the Stellar Soroban VM. `StellarAssetService.fetchSorobanBalance` queries Soroban contract state.

**Stellar DEX (SDEX)**  
The on-chain decentralised exchange built into the Stellar protocol. Supports limit orders (`manageSellOffer`, `manageBuyOffer`) and path payments. `StellarDexService` uses `manageSellOffer` for market sells.

**Liquidity Pool (AMM)**  
Stellar's constant-product AMM pools that operate alongside the orderbook. Represented as `liquidity_pool_shares` in account balances.

---

## SDK Concepts

**`MuwpSdk`**  
The primary SDK entry point. Composes `WalletService` + `StellarAssetService` and exposes `resolvedConfig`.

**`StellarAssetService`**  
Handles Stellar asset lifecycle: trustlines, issuance, balance queries, and cross-chain bridge estimation via Allbridge.

**`StellarDexService`**  
Interacts with the Stellar DEX: fetches orderbooks and submits market sell orders.

**`SwapService`**  
Orchestrates the full EVM → Stellar swap: initiation → signing → fund notification → DEX swap. Returns `SwapExecutionResult` with per-phase `metrics`.

**`PerfTimer`**  
Utility class that records start/stop times for named phases and returns a `Record<string, number>` summary in milliseconds.

**`RouteRecord`**  
A map of `tokenAddress → Route[]` returned by `/api/quote`. Each key is an input token address; each value is an array of route options.

**`BalanceSummary`**  
Normalized account balance returned by `fetchBalances()`. Fields: `assetCode`, `assetIssuer`, `assetType`, `balance`, `limit`, `isNative`.

**`BridgePairMetadata`**  
Resolved Allbridge source/destination token pair with chain details. Used by `estimateBridgeAmount` and `describeAsset`.
