import {
    createPublicClient,
    http,
    Address,
    PublicClient,
} from "viem";
import { mainnet, goerli, arbitrum, optimism, polygon } from "viem/chains";
import { ChainId } from "@uniswap/sdk-core";
// Supported chains
export const chains = {
    [ChainId.MAINNET]: mainnet,
    [ChainId.GOERLI]: goerli,
    [ChainId.ARBITRUM_ONE]: arbitrum,
    [ChainId.OPTIMISM]: optimism,
    [ChainId.POLYGON]: polygon,
};

// Custom RPC URLs (you can add these to your environment variables)
export const customRPCs: { [key in ChainId]?: string } = {
    [ChainId.MAINNET]: process.env.MAINNET_RPC,
    // Add other RPCs as needed
};

// Cache for clients
export const clientCache: { [key: string]: PublicClient } = {};

// Addresses
export const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: { [key in ChainId]?: Address } = {
    [ChainId.MAINNET]: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    [ChainId.ARBITRUM_ONE]: "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
};

export function getClient(chainId: ChainId, customRPC?: string): PublicClient | null {
    if (!chains[chainId as keyof typeof chains]) {
        return null; // Invalid chain ID
    }

    const cacheKey = `${chainId}-${customRPC || "default"}`;
    if (clientCache[cacheKey]) {
        return clientCache[cacheKey];
    }

    const chain = chains[chainId as keyof typeof chains];
    const transport = customRPC ? http(customRPC) : http();
    const client = createPublicClient({ chain, transport });
    clientCache[cacheKey] = client as PublicClient;
    return client as PublicClient;
}