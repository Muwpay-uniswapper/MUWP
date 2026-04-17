import {
    Address,
    PublicClient,
} from "viem";
import { FeeAmount, Pool } from "@uniswap/v3-sdk";
import { Token, ChainId } from "@uniswap/sdk-core";
import { FACTORY_ADDRESS as V3_FACTORY_ADDRESS } from "@uniswap/v3-sdk";
import { abi as IUniswapV3PoolABI } from "@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json";
import { retry } from "./utils";
import { NONFUNGIBLE_POSITION_MANAGER_ADDRESSES } from "./network";

export async function getV3PoolData(
    client: PublicClient,
    token0Address: Address,
    token1Address: Address,
    chainId: ChainId,
    walletAddress?: string,
) {
    const factoryAddress = V3_FACTORY_ADDRESS;

    const poolAddress = (await retry(() =>
        client.readContract({
            address: factoryAddress,
            abi: [
                {
                    inputs: [
                        { type: "address" },
                        { type: "address" },
                        { type: "uint24" },
                    ],
                    name: "getPool",
                    outputs: [{ type: "address" }],
                    type: "function",
                },
            ],
            functionName: "getPool",
            args: [token0Address, token1Address, 3000], // Assuming 0.3% fee tier
        }),
    )) as Address;

    if (poolAddress === "0x0000000000000000000000000000000000000000") {
        return null; // Pool does not exist
    }

    const [slot0, liquidity, token0, token1, fee] = await retry(() =>
        client.multicall({
            contracts: [
                {
                    address: poolAddress,
                    abi: IUniswapV3PoolABI,
                    functionName: "slot0",
                },
                {
                    address: poolAddress,
                    abi: IUniswapV3PoolABI,
                    functionName: "liquidity",
                },
                {
                    address: poolAddress,
                    abi: IUniswapV3PoolABI,
                    functionName: "token0",
                },
                {
                    address: poolAddress,
                    abi: IUniswapV3PoolABI,
                    functionName: "token1",
                },
                {
                    address: poolAddress,
                    abi: IUniswapV3PoolABI,
                    functionName: "fee",
                },
            ],
        }),
    );

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
        tick,
    );

    const price = pool.token0Price.toSignificant(6);

    let walletPositions;
    if (walletAddress) {
        const positionManagerAddress =
            NONFUNGIBLE_POSITION_MANAGER_ADDRESSES[chainId];
        if (!positionManagerAddress) {
            return null; // Nonfungible position manager not found for this chain
        }
        const positionManagerABI = [
            {
                inputs: [{ type: "address" }],
                name: "balanceOf",
                outputs: [{ type: "uint256" }],
                type: "function",
            },
            {
                inputs: [{ type: "address" }, { type: "uint256" }],
                name: "tokenOfOwnerByIndex",
                outputs: [{ type: "uint256" }],
                type: "function",
            },
            {
                inputs: [{ type: "uint256" }],
                name: "positions",
                outputs: [
                    { type: "uint96", name: "nonce" },
                    { type: "address", name: "operator" },
                    { type: "address", name: "token0" },
                    { type: "address", name: "token1" },
                    { type: "uint24", name: "fee" },
                    { type: "int24", name: "tickLower" },
                    { type: "int24", name: "tickUpper" },
                    { type: "uint128", name: "liquidity" },
                    { type: "uint256", name: "feeGrowthInside0LastX128" },
                    { type: "uint256", name: "feeGrowthInside1LastX128" },
                    { type: "uint128", name: "tokensOwed0" },
                    { type: "uint128", name: "tokensOwed1" },
                ],
                type: "function",
            },
        ];

        // Get the number of positions for the wallet
        const balanceOf = await retry(() =>
            client.readContract({
                address: positionManagerAddress,
                abi: positionManagerABI,
                functionName: "balanceOf",
                args: [walletAddress as Address],
            }),
        );

        // Fetch each position
        walletPositions = [];
        for (let i = 0; i < Number(balanceOf); i++) {
            const tokenId = (await retry(() =>
                client.readContract({
                    address: positionManagerAddress,
                    abi: positionManagerABI,
                    functionName: "tokenOfOwnerByIndex",
                    args: [walletAddress as Address, BigInt(i)],
                }),
            )) as bigint;

            const position = (await retry(() =>
                client.readContract({
                    address: positionManagerAddress,
                    abi: positionManagerABI,
                    functionName: "positions",
                    args: [tokenId as bigint],
                }),
            )) as {
                nonce: bigint;
                operator: Address;
                token0: Address;
                token1: Address;
                fee: FeeAmount;
                tickLower: number;
                tickUpper: number;
                liquidity: bigint;
                feeGrowthInside0LastX128: bigint;
                feeGrowthInside1LastX128: bigint;
                tokensOwed0: bigint;
                tokensOwed1: bigint;
            };

            // Check if this position is for the current pool
            if (
                position.token0 === token0.result &&
                position.token1 === token1.result &&
                position.fee === fee.result
            ) {
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
        version: "v3",
        walletPositions,
    };
}
