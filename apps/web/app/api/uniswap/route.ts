// app/api/uniswap/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createPublicClient, http, Address, formatUnits, PublicClient, InvalidAddressError } from 'viem';
import { mainnet, goerli, arbitrum, optimism, polygon } from 'viem/chains';
import { FeeAmount, Pool } from '@uniswap/v3-sdk';
import { Token, ChainId, V2_FACTORY_ADDRESSES } from '@uniswap/sdk-core';
import { FACTORY_ADDRESS as V3_FACTORY_ADDRESS } from '@uniswap/v3-sdk';
import { abi as IUniswapV2PairABI } from '@uniswap/v2-core/build/IUniswapV2Pair.json';
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { z } from 'zod';

// Supported chains
const chains = {
    [ChainId.MAINNET]: mainnet,
    [ChainId.GOERLI]: goerli,
    [ChainId.ARBITRUM_ONE]: arbitrum,
    [ChainId.OPTIMISM]: optimism,
    [ChainId.POLYGON]: polygon,
};

// Custom RPC URLs (you can add these to your environment variables)
const customRPCs: { [key in ChainId]?: string } = {
    [ChainId.MAINNET]: process.env.MAINNET_RPC,
    // Add other RPCs as needed
};

// Zod schema for input validation
const InputSchema = z.object({
    token0: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    token1: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    version: z.enum(['v2', 'v3']),
    chainId: z.number().int().positive().default(ChainId.MAINNET),
    rpc: z.string().url().optional(),
    walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});

// Cache for clients
const clientCache: { [key: string]: PublicClient } = {};

// Addresses
const NONFUNGIBLE_POSITION_MANAGER_ADDRESSES: { [key in ChainId]?: Address } = {
    [ChainId.MAINNET]: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    [ChainId.ARBITRUM_ONE]: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
}

function getClient(chainId: ChainId, customRPC?: string): PublicClient | null {
    if (!chains[chainId as keyof typeof chains]) {
        return null; // Invalid chain ID
    }

    const cacheKey = `${chainId}-${customRPC || 'default'}`;
    if (clientCache[cacheKey]) {
        return clientCache[cacheKey];
    }

    const chain = chains[chainId as keyof typeof chains];
    const transport = customRPC ? http(customRPC) : http();
    const client = createPublicClient({ chain, transport });
    clientCache[cacheKey] = client as PublicClient;
    return client as PublicClient;
}

async function retry<T>(fn: () => Promise<T>, maxRetries = 2, delay = 500): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (error instanceof InvalidAddressError) {
            return null as T; // Pool does not exist
        }
        if (maxRetries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, maxRetries - 1, delay * 2);
    }
}

function serializeBigInt(obj: any): any {
    if (typeof obj === 'bigint') {
        return obj.toString();
    } else if (Array.isArray(obj)) {
        return obj.map(serializeBigInt);
    } else if (typeof obj === 'object' && obj !== null) {
        return Object.fromEntries(
            Object.entries(obj).map(([key, value]) => [key, serializeBigInt(value)])
        );
    }
    return obj;
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const input = {
        token0: searchParams.get('token0'),
        token1: searchParams.get('token1'),
        version: searchParams.get('version'),
        chainId: Number(searchParams.get('chainId')) || ChainId.MAINNET,
        rpc: searchParams.get('rpc') || undefined,
        walletAddress: searchParams.get('walletAddress') || undefined,
    };

    try {
        const validatedInput = await InputSchema.parseAsync(input);
        const { token0, token1, version, chainId, rpc, walletAddress } = validatedInput;

        const client = getClient(chainId, rpc || customRPCs[chainId as keyof typeof customRPCs]);
        if (!client) {
            return NextResponse.json({ error: 'Invalid chain ID' }, { status: 400 });
        }

        let poolData;
        if (version === 'v2') {
            poolData = await getV2PoolData(client, token0 as Address, token1 as Address, chainId, walletAddress);
        } else {
            poolData = await getV3PoolData(client, token0 as Address, token1 as Address, chainId, walletAddress);
        }

        if (!poolData) {
            return NextResponse.json({ error: 'Pool does not exist' }, { status: 404 });
        }

        return NextResponse.json(serializeBigInt(poolData));
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid input parameters', details: error.errors }, { status: 400 });
        }
        console.error('Error fetching pool data:', error);
        return NextResponse.json({ error: 'Failed to fetch pool data' }, { status: 500 });
    }
}

async function getV2PoolData(client: PublicClient, token0Address: Address, token1Address: Address, chainId: ChainId, walletAddress?: string) {
    const factoryAddress = V2_FACTORY_ADDRESSES[chainId] as Address;

    const pairAddress = await retry(() => client.readContract({
        address: factoryAddress,
        abi: [{
            inputs: [{ type: 'address' }, { type: 'address' }],
            name: 'getPair',
            outputs: [{ type: 'address' }],
            type: 'function'
        }],
        functionName: 'getPair',
        args: [token0Address, token1Address],
    })) as Address;

    if (pairAddress === '0x0000000000000000000000000000000000000000') {
        return null; // Pool does not exist
    }

    const [reserves, token0, token1, totalSupply] = await retry(() => client.multicall({
        contracts: [
            {
                address: pairAddress,
                abi: IUniswapV2PairABI,
                functionName: 'getReserves',
            },
            {
                address: pairAddress,
                abi: IUniswapV2PairABI,
                functionName: 'token0',
            },
            {
                address: pairAddress,
                abi: IUniswapV2PairABI,
                functionName: 'token1',
            },
            {
                address: pairAddress,
                abi: IUniswapV2PairABI,
                functionName: 'totalSupply',
            },
        ],
    }));

    if (!reserves.result || !totalSupply.result) {
        return null; // Pool does not exist
    }

    const [reserve0, reserve1] = reserves.result as [bigint, bigint];
    const price = Number(reserve1) / Number(reserve0);

    let walletPosition;
    if (walletAddress) {
        const balance = await retry(() => client.readContract({
            address: pairAddress,
            abi: IUniswapV2PairABI,
            functionName: 'balanceOf',
            args: [walletAddress as Address],
        }));

        walletPosition = {
            lpTokenBalance: formatUnits(balance as bigint, 18),
            share: Number(balance) / Number(totalSupply.result),
        };
    }

    return {
        poolAddress: pairAddress,
        token0: token0.result,
        token1: token1.result,
        reserve0: formatUnits(reserve0, 18),
        reserve1: formatUnits(reserve1, 18),
        totalSupply: formatUnits(totalSupply.result as bigint, 18),
        price,
        liquidity: formatUnits(totalSupply.result as bigint, 18),
        version: 'v2',
        walletPosition,
    };
}

async function getV3PoolData(client: PublicClient, token0Address: Address, token1Address: Address, chainId: ChainId, walletAddress?: string) {
    const factoryAddress = V3_FACTORY_ADDRESS;

    const poolAddress = await retry(() => client.readContract({
        address: factoryAddress,
        abi: [{
            inputs: [{ type: 'address' }, { type: 'address' }, { type: 'uint24' }],
            name: 'getPool',
            outputs: [{ type: 'address' }],
            type: 'function'
        }],
        functionName: 'getPool',
        args: [token0Address, token1Address, 3000], // Assuming 0.3% fee tier
    })) as Address;

    if (poolAddress === '0x0000000000000000000000000000000000000000') {
        return null; // Pool does not exist
    }

    const [slot0, liquidity, token0, token1, fee] = await retry(() => client.multicall({
        contracts: [
            {
                address: poolAddress,
                abi: IUniswapV3PoolABI,
                functionName: 'slot0',
            },
            {
                address: poolAddress,
                abi: IUniswapV3PoolABI,
                functionName: 'liquidity',
            },
            {
                address: poolAddress,
                abi: IUniswapV3PoolABI,
                functionName: 'token0',
            },
            {
                address: poolAddress,
                abi: IUniswapV3PoolABI,
                functionName: 'token1',
            },
            {
                address: poolAddress,
                abi: IUniswapV3PoolABI,
                functionName: 'fee',
            },
        ],
    }));

    const [sqrtPriceX96, tick] = slot0.result as [bigint, number];

    // Create Token instances
    const token0Instance = new Token(chainId, token0.result as string, 18); // Assuming 18 decimals
    const token1Instance = new Token(chainId, token1.result as string, 18); // Assuming 18 decimals

    // Create Pool instance
    const pool = new Pool(
        token0Instance,
        token1Instance,
        fee.result as FeeAmount,
        sqrtPriceX96.toString(),
        (liquidity.result as bigint).toString(),
        tick
    );

    const price = pool.token0Price.toSignificant(6);

    let walletPositions;
    if (walletAddress) {
        const positionManagerAddress = NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId];
        if (!positionManagerAddress) {
            return null; // Nonfungible position manager not found for this chain
        }
        const positionManagerABI = [
            {
                inputs: [{ type: 'address' }],
                name: 'balanceOf',
                outputs: [{ type: 'uint256' }],
                type: 'function'
            },
            {
                inputs: [{ type: 'address' }, { type: 'uint256' }],
                name: 'tokenOfOwnerByIndex',
                outputs: [{ type: 'uint256' }],
                type: 'function'
            },
            {
                inputs: [{ type: 'uint256' }],
                name: 'positions',
                outputs: [
                    { type: 'uint96', name: 'nonce' },
                    { type: 'address', name: 'operator' },
                    { type: 'address', name: 'token0' },
                    { type: 'address', name: 'token1' },
                    { type: 'uint24', name: 'fee' },
                    { type: 'int24', name: 'tickLower' },
                    { type: 'int24', name: 'tickUpper' },
                    { type: 'uint128', name: 'liquidity' },
                    { type: 'uint256', name: 'feeGrowthInside0LastX128' },
                    { type: 'uint256', name: 'feeGrowthInside1LastX128' },
                    { type: 'uint128', name: 'tokensOwed0' },
                    { type: 'uint128', name: 'tokensOwed1' }
                ],
                type: 'function'
            }
        ];

        // Get the number of positions for the wallet
        const balanceOf = await retry(() => client.readContract({
            address: positionManagerAddress,
            abi: positionManagerABI,
            functionName: 'balanceOf',
            args: [walletAddress as Address],
        }));

        // Fetch each position
        walletPositions = [];
        for (let i = 0; i < Number(balanceOf); i++) {
            const tokenId = await retry(() => client.readContract({
                address: positionManagerAddress,
                abi: positionManagerABI,
                functionName: 'tokenOfOwnerByIndex',
                args: [walletAddress as Address, BigInt(i)],
            })) as bigint;

            const position = await retry(() => client.readContract({
                address: positionManagerAddress,
                abi: positionManagerABI,
                functionName: 'positions',
                args: [tokenId as bigint],
            })) as {
                nonce: bigint,
                operator: Address,
                token0: Address,
                token1: Address,
                fee: FeeAmount,
                tickLower: number,
                tickUpper: number,
                liquidity: bigint,
                feeGrowthInside0LastX128: bigint,
                feeGrowthInside1LastX128: bigint,
                tokensOwed0: bigint,
                tokensOwed1: bigint,
            };

            // Check if this position is for the current pool
            if (position.token0 === token0.result && position.token1 === token1.result && position.fee === fee.result) {
                walletPositions.push({
                    tokenId: tokenId.toString(),
                    liquidity: position.liquidity.toString(),
                    tickLower: position.tickLower,
                    tickUpper: position.tickUpper,
                });
            }
        }
    }

    return {
        poolAddress,
        token0: token0.result,
        token1: token1.result,
        fee: fee.result,
        sqrtPriceX96: sqrtPriceX96.toString(),
        liquidity: (liquidity.result as bigint).toString(),
        tick,
        price,
        token0Price: pool.token0Price.toSignificant(6),
        token1Price: pool.token1Price.toSignificant(6),
        version: 'v3',
        walletPositions,
    };
}