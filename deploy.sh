#!/usr/bin/env bash

# This script is used to deploy the contract

CONTRACT_PATH=src/MUWPTransfer.sol
PRIVATE_KEY="f8487218c07526de64adff2a382d1bc9320738b8912187b5b27267b69761b3e8"
HTTPS_ENDPOINT="https://optimism.llamarpc.com"


forge create MUWPTransfer --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url $HTTPS_ENDPOINT