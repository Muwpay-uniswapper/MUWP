#!/usr/bin/env bun
import { fromHex } from 'viem'
import { generatePrivateKey } from 'viem/accounts'

const privateKey = generatePrivateKey()
const number = fromHex(privateKey, "bigint")
// Convert to base 36
const base58 = number.toString(36)

console.log(base58.slice(0, 32))