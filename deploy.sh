#!/usr/bin/env bash

# This script is used to deploy the contract

CONTRACT_PATH=src/MUWPTransfer.sol
PRIVATE_KEY="97e74b612c20179a0767b7f6bdfd41f3f14fe9ae84d7a61468b0fae08ee33fe8"
HTTPS_ENDPOINT="https://compatible-attentive-hill.ethereum-goerli.quiknode.pro/605f2cebb110d52b809352ccd73381e39ad9d82a/"


forge create MUWPTransfer --contracts $CONTRACT_PATH --private-key $PRIVATE_KEY --rpc-url $HTTPS_ENDPOINT