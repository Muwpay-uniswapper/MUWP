import { ethers } from 'ethers'
import { test as base } from '@playwright/test'
import { injectHeadlessWeb3Provider, Web3ProviderBackend } from 'headless-web3-provider'
import dotenv from 'dotenv'
dotenv.config();

type InjectWeb3Provider = (
	privateKeys?: string[]
) => Promise<Web3ProviderBackend>

export const test = base.extend<{
	signers: [string, ...string[]]
	accounts: string[]
	injectWeb3Provider: InjectWeb3Provider
	rpcURL: string
}>({
	signers: [
		// anvil dev key
		process.env.WALLET_PK!,
	],

	accounts: async ({ signers }, use) => {
		await use(signers.map((k) => new ethers.Wallet(k).address.toLowerCase()))
	},

	// eslint-disable-next-line no-empty-pattern
	rpcURL: async ({ }, use) => {
		// Get Ethereum RPC URL
		const rpc = "https://polygon-rpc.com"
		await use(rpc)
	},

	injectWeb3Provider: async ({ page, signers, rpcURL }, use) => {
		await use((privateKeys = signers) =>
			injectHeadlessWeb3Provider(page, privateKeys, 137, rpcURL)
		)
	},
})

export const { expect } = test