#!/usr/bin/env bash

# This script is used to deploy the contract

CONTRACT_PATH=./src/MUWPTransfer.sol
PRIVATE_KEY="f8487218c07526de64adff2a382d1bc9320738b8912187b5b27267b69761b3e8"
HTTPS_ENDPOINT="https://eth.llamarpc.com"
ETHERSCAN_API_KEY="QIPT5GVCDCVRJKSH2VTTIDJ3NKVRUBPCSI"
POLYGONSCAN_API_KEY="BSZ82VGXVVRS4MNRR8XQUR4UGVXYG73WY7"
BSCSCAN_API_KEY="IXNZ595JQDQNB1RMSQVR9YAVMWQBPK9VK3"
AVAXSCAN_API_KEY="TPR7RCZX9A1Y8JUP4HUKN4BK8EQJ68ANT6"
ARBISCAN_API_KEY="1JS9796B33BXMMGI5RNZAERZ4IJDZ5JGJ2"
BASESCAN_API_KEY="9TX9BJ6N65R5RNGGX8GQ5NSDZGSHWPWB2U"

# # Goerli
# echo "Deploying to Goerli network"
# forge create MUWPTransfer --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url "https://ethereum-goerli-rpc.publicnode.com" --verify -e $ETHERSCAN_API_KEY

# Ethereum
# echo "Deploying to Ethereum network"
# forge create MUWPTransfer --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url $HTTPS_ENDPOINT --verify -e $ETHERSCAN_API_KEY

# Polygon
# echo "Deploying to Polygon network"
# forge create MUWPTransfer --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url "https://polygon.llamarpc.com" --verify -e $POLYGONSCAN_API_KEY

# Binance
# echo "Deploying to Binance network"
# forge create MUWPTransfer --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url "https://binance.llamarpc.com" --verify -e $BSCSCAN_API_KEY

# Avalanche
# echo "Deploying to Avalanche network"
# forge create MUWPTransfer --legacy --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url "https://avalanche.drpc.org" --verify -e $AVAXSCAN_API_KEY

# Arbitrum
# echo "Deploying to Arbitrum network"
# forge create MUWPTransfer --legacy --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url "https://arbitrum.drpc.org" --verify -e $ARBISCAN_API_KEY

# Optimism
# echo "Deploying to Optimism network"
# forge create MUWPTransfer --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url "https://mainnet.optimism.io" --verify

# Base
# echo "Deploying to Base network"
# forge create MUWPTransfer --legacy --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url "https://base.llamarpc.com" --verify -e $BASESCAN_API_KEY


