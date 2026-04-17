import {
    Address,
    formatUnits,
    PublicClient,
} from "viem";
import { ChainId, V2_FACTORY_ADDRESSES } from "@uniswap/sdk-core";
import { abi as IUniswapV2PairABI } from "@uniswap/v2-core/build/IUniswapV2Pair.json";
import { retry } from "./utils";

export async function getV2PoolData(
    client: PublicClient,
    token0Address: Address,
    token1Address: Address,
    chainId: ChainId,
    walletAddress?: string,
) {
    const factoryAddress = V2_FACTORY_ADDRESSES[chainId] as Address;

    const pairAddress = (await retry(() =>
        client.readContract({
            address: factoryAddress,
            abi: [
                {
                    inputs: [{ type: "address" }, { type: "address" }],
                    name: "getPair",
                    outputs: [{ type: "address" }],
                    type: "function",
                },
            ],
            functionName: "getPair",
            args: [
                token0Address < token1Address ? token0Address : token1Address,
                token0Address < token1Address ? token1Address : token0Address,
            ],
        }),
    )) as Address;

    if (
        !pairAddress ||
        pairAddress === "0x0000000000000000000000000000000000000000"
    ) {
        console.log("Pair address is 0x");
        return null; // Pool does not exist
    }

    const [reserves, token0, token1, totalSupply] = await retry(() =>
        client.multicall({
            contracts: [
                {
                    address: pairAddress,
                    abi: IUniswapV2PairABI,
                    functionName: "getReserves",
                },
                {
                    address: pairAddress,
                    abi: IUniswapV2PairABI,
                    functionName: "token0",
                },
                {
                    address: pairAddress,
                    abi: IUniswapV2PairABI,
                    functionName: "token1",
                },
                {
                    address: pairAddress,
                    abi: IUniswapV2PairABI,
                    functionName: "totalSupply",
                },
            ],
        }),
    );

    if (!reserves.result || !totalSupply.result) {
        console.log("Reserves or total supply is null");
        // Print all errors / results
        console.log({
            reserves,
            totalSupply,
            token0,
            token1,
        });
        return null; // Pool does not exist
    }

    const [reserve0, reserve1] = reserves.result as [bigint, bigint];
    const price = Number(reserve1) / Number(reserve0);

    let walletPosition;
    if (walletAddress) {
        const balance = await retry(() =>
            client.readContract({
                address: pairAddress,
                abi: IUniswapV2PairABI,
                functionName: "balanceOf",
                args: [walletAddress as Address],
            }),
        );

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
        version: "v2",
        walletPosition,
    };
}
