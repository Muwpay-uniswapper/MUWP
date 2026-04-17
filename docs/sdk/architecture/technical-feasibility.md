# Technical Feasibility

## Why Stellar for Multi-Token Swaps?

Stellar provides three properties that make it well-suited as the destination chain for MUWP's multi-token swap prototype:

1. **Native DEX** — Stellar has an on-chain order book (SDEX) and automated market makers (liquidity pools). Any bridged asset can be swapped to XLM immediately after arriving on-chain, without a separate DEX protocol.

2. **Low fees** — Base transaction fee is 100 stroops (0.00001 XLM ≈ $0.000003). Multi-operation transactions are batched cheaply.

3. **Fast finality** — 3–5 second block time with deterministic finality. No waiting for confirmations.

## Bridge Strategy

MUWP uses **Allbridge Core** to move tokens from EVM chains to Stellar. The flow:

```
EVM token (USDC, USDT, …)
    ↓ Allbridge bridge
Stellar: USDC (ABr) or token-equivalent
    ↓ Stellar DEX (manageSellOffer)
XLM
```

Allbridge is chosen because:
- It supports 15+ EVM chains → Stellar
- It uses a lock-and-mint model with verified bridge validators
- The `@allbridge/bridge-core-sdk` provides amount estimation before committing

## Multi-Token Collection (EVM side)

On the EVM side, the `MUWPTransfer.sol` smart contract batch-collects multiple tokens in a single transaction:

```solidity
function transfer(
    address[] calldata tokens,
    address[] calldata froms,
    uint256[] calldata amounts,
    address to,
    bytes calldata signature
) external;
```

The backend signs a payload authorizing which tokens/amounts/senders are valid, preventing unauthorized withdrawals.

## Scalability Considerations

| Component | Current approach | Scaling path |
|-----------|-----------------|-------------|
| Quote aggregation | Sequential per bridge | Parallel `Promise.all` per bridge |
| Bridge selection | Allbridge only for Stellar | Add more bridges (e.g., Starbridge) |
| DEX execution | Single `manageSellOffer` | Path payments for better price execution |
| Temp accounts | Server-generated, stored in KV | Use Stellar's transaction memo for stateless flows |

## Known Limitations (Milestone 1)

- The Stellar DEX swap executes at market price (best bid). For large amounts, slippage is not bounded by the current implementation. A `minPrice` parameter exists but is not enforced on-chain.
- Soroban token balances (`fetchSorobanBalance`) require a Soroban RPC endpoint — not configured by default in testnet demos.
- The Inngest orchestration workflow handles retries server-side; the SDK has no built-in retry logic for failed submissions.
