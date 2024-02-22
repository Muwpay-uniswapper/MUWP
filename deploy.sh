#!/usr/bin/env bash

# This script is used to deploy the contract

CONTRACT_PATH=./src/MUWPTransfer.sol
PRIVATE_KEY="f8487218c07526de64adff2a382d1bc9320738b8912187b5b27267b69761b3e8"
HTTPS_ENDPOINT="https://eth.llamarpc.com"
ETHERSCAN_API_KEY="QIPT5GVCDCVRJKSH2VTTIDJ3NKVRUBPCSI"

# Goerli

forge create MUWPTransfer --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url "https://goerli.llamarpc.com" --verify

# Ethereum

forge create MUWPTransfer --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url $HTTPS_ENDPOINT --verify

# Polygon

forge create MUWPTransfer --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url "https://polygon.llamarpc.com" --verify

# Binance

forge create MUWPTransfer --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url "https://binance.llamarpc.com" --verify

# Avalanche

forge create MUWPTransfer --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url "https://avalanche.drpc.org" --verify

# Arbitrum

forge create MUWPTransfer --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url "https://arbitrum.llamarpc.com" --verify

# Optimism

forge create MUWPTransfer --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url "https://mainnet.optimism.io" --verify

# Base

forge create MUWPTransfer --use "0.8.22" --optimize --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url "https://base.llamarpc.com" --verify

