# Swap Sequence Diagram

```mermaid
sequenceDiagram
    participant User as User
    participant Wallet as User Wallet
    participant SP as Smart Protocol Optimization (MUWP)
    participant DEX as External DEX
    participant Bridge as Cross-Chain Bridge
    participant Stellar as Stellar Network (Soroban)

    User->>Wallet: Connect Wallet
    Wallet-->>SP: Send Token Holdings
    User->>SP: Select Token & Destination (XLM)
    SP->>DEX: Query Best Swap Routes
    SP->>Bridge: Query Cross-Chain Routes
    DEX-->>SP: Return Options
    Bridge-->>SP: Return Cross-Chain Options
    SP->>User: Propose Optimal Route
    alt Optimal Route via DEX
        User->>DEX: Confirm Swap
        DEX->>Stellar: Execute Swap to XLM
    else Optimal Route via Bridge
        User->>Bridge: Confirm Swap
        Bridge->>Stellar: Execute Cross-Chain Swap to XLM
    end
    Stellar-->>User: Transfer XLM to Wallet
    User->>SP: Acknowledge Receipt & Rate Experience
```

MUWP seamlessly facilitates cross-chain token swaps to Stellar's XLM, leveraging user interactions, AI protocol optimization, and Soroban Smart Contracts for a streamlined experience.

---

## Detailed Step Explanation

| Step | Description |
|------|-------------|
| 1. Connect Wallet | Establishes a secure connection, enabling MUWP to access token holdings for swaps |
| 2. Send Token Holdings | Identifies assets available for swapping, essential for route optimization |
| 3. Select Token & Destination | User-driven decision process, initiating the swap |
| 4. Query DEX & Bridge | Gathers possible swap paths, covering both on-chain and cross-chain options |
| 5. Return Options | Enables the Smart Protocol to analyze and select the most efficient route |
| 6. Propose Optimal Route | Recommends the most cost-efficient and swift path to the user |
| 7. Confirm Swap | User consent before proceeding with the transaction |
| 8. Execute on Stellar | Soroban smart contracts execute the swap securely and efficiently |
| 9. Transfer XLM | XLM is delivered to the user's wallet — the successful conclusion of the swap |
| 10. Acknowledge & Rate | Feedback mechanism for continuous service improvement |
