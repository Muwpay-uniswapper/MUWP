// app/api/uniswap-pool/uniswap-pool.test.ts
import { describe, it, expect } from 'bun:test';
import { GET } from './route';
import { NextRequest } from 'next/server';

describe('Uniswap Pool API', () => {
    const createRequest = (params: Record<string, string>): NextRequest => {
        const url = new URL('https://example.com/api/uniswap-pool');
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
        return new NextRequest(url);
    };

    it('should return 400 if required parameters are missing', async () => {
        const req = createRequest({});
        const res = await GET(req);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data).toMatchObject({
            error: "Invalid input parameters",
            details: expect.any(Array)
        });
    });

    it('should fetch V2 pool data successfully', async () => {
        const req = createRequest({
            token0: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
            token1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
            version: 'v2',
            chainId: '1',
        });

        const res = await GET(req);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toMatchObject({
            poolAddress: expect.any(String),
            token0: expect.any(String),
            token1: expect.any(String),
            reserve0: expect.any(String),
            reserve1: expect.any(String),
            totalSupply: expect.any(String),
            price: expect.any(Number),
            liquidity: expect.any(String),
            version: 'v2',
        });
    }, 15000);

    it('should fetch V3 pool data successfully', async () => {
        const req = createRequest({
            token0: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
            token1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
            version: 'v3',
            chainId: '1',
        });

        const res = await GET(req);

        expect(res.status).toBe(200);
        const data = await res.json();
        expect(data).toMatchObject({
            poolAddress: expect.any(String),
            token0: expect.any(String),
            token1: expect.any(String),
            fee: expect.any(Number),
            sqrtPriceX96: expect.any(String),
            liquidity: expect.any(String),
            tick: expect.any(Number),
            price: expect.any(String),
            token0Price: expect.any(String),
            token1Price: expect.any(String),
            version: 'v3',
        });
    }, 15000);


    it('should handle non-existent pool', async () => {
        const req = createRequest({
            token0: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
            token1: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F985', // Non existant token (assuming no direct pool)
            version: 'v2',
            chainId: '1',
        });

        const res = await GET(req);

        expect(res.status).toBe(404);
        const data = await res.json();
        expect(data).toEqual({ error: 'Pool does not exist' });
    }, 15000);

    it('should handle invalid chain ID', async () => {
        const req = createRequest({
            token0: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
            token1: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
            version: 'v2',
            chainId: '999', // Invalid chain ID
        });

        const res = await GET(req);

        expect(res.status).toBe(400);
        const data = await res.json();
        expect(data).toEqual({ error: 'Invalid chain ID' });
    }, 15000);
});
