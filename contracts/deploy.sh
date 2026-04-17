#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | sed 's/\r$//' | awk '/=/ {print $1}' | xargs)
else
    echo "⚠️  .env file not found"
    exit 1
fi

# Verify required environment variables
required_vars=(
    "DEPLOYER"
    "ARBISCAN_API_KEY"
    # "SNOWTRACE_API_KEY"
    "BASESCAN_API_KEY"
    "BSCSCAN_API_KEY"
    "FTMSCAN_API_KEY"
    "OPTIMISTIC_ETHERSCAN_API_KEY"
    "POLYGONSCAN_API_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Required environment variable $var is not set"
        exit 1
    fi
done

# Contract deployment address (now from .env)
DEPLOYER="${DEPLOYER:-0x2B4c9121d7bA7EBdC933F2F58020c484F219Cd1e}"

# Chain IDs
ARBITRUM_CHAIN_ID=42161
AVALANCHE_CHAIN_ID=43114
BASE_CHAIN_ID=8453
BSC_CHAIN_ID=56
FANTOM_CHAIN_ID=250
OPTIMISM_CHAIN_ID=10
POLYGON_CHAIN_ID=137

# Function to deploy to a specific chain
deploy_to_chain() {
    local chain_name=$1
    local chain_id=$2
    local rpc_url=$3
    local etherscan_key=$4

    echo "Deploying to $chain_name..."
    
    forge script script/Deploy.s.sol \
        --rpc-url $rpc_url \
        --broadcast \
        --ledger \
        --mnemonic-indexes 1 \
        --sender $DEPLOYER \
        --chain-id $chain_id \
        --verify \
        --etherscan-api-key $etherscan_key

    if [ $? -eq 0 ]; then
        echo "✅ Deployment to $chain_name successful"
    else
        echo "❌ Deployment to $chain_name failed"
    fi
    echo "-------------------"
    
    # Add delay between deployments
    sleep 10
}

# Deploy to each chain
echo "Starting deployments..."

# Arbitrum
deploy_to_chain "Arbitrum" $ARBITRUM_CHAIN_ID "https://arb1.arbitrum.io/rpc" $ARBISCAN_API_KEY

# Avalanche
deploy_to_chain "Avalanche" $AVALANCHE_CHAIN_ID "https://api.avax.network/ext/bc/C/rpc" $SNOWTRACE_API_KEY

# Base
deploy_to_chain "Base" $BASE_CHAIN_ID "https://mainnet.base.org" $BASESCAN_API_KEY

# BSC
deploy_to_chain "BSC" $BSC_CHAIN_ID "https://bsc-dataseed.binance.org" $BSCSCAN_API_KEY

# Fantom
deploy_to_chain "Fantom" $FANTOM_CHAIN_ID "https://rpc.ftm.tools" $FTMSCAN_API_KEY

# Optimism
deploy_to_chain "Optimism" $OPTIMISM_CHAIN_ID "https://mainnet.optimism.io" $OPTIMISTIC_ETHERSCAN_API_KEY

# Polygon
deploy_to_chain "Polygon" $POLYGON_CHAIN_ID "https://polygon-rpc.com" $POLYGONSCAN_API_KEY

# Ethereum
deploy_to_chain "Ethereum" $ETHEREUM_CHAIN_ID $MAINNET_RPC $ETHERSCAN_API_KEY

echo "All deployments completed!"
