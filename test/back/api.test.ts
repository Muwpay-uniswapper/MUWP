import { parseUnits } from "viem";
import { createConfiguration, DefaultApi, AdvancedApi, server2, Step } from "../../lib/li.fi-ts";
import { expect } from "chai";
import { LiFi, LifiStep } from '@lifi/sdk'

describe("Li.Fi API", function () {
    const config = createConfiguration({
        baseServer: server2
    });
    const api = new DefaultApi(config);
    const advancedAPI = new AdvancedApi(config);

    it("Should get a quote", async function () {
        const res = await api.quoteGet("1", "1", "ETH", "USDC", "0x492804d7740150378be8d4bbf8ce012c5497dea9", parseUnits("1", 18).toString());

        expect(res).to.not.be.undefined;
    });

    it("Should fetch tokens", async function () {
        const res = await api.tokensGet("1");

        expect(res.tokens).to.not.be.undefined;
        expect(res.tokens?.length).to.be.greaterThan(0);
    });

    it("Should fetch routes", async function () {
        const routes = await advancedAPI.advancedRoutesPost({
            fromAmount: "199699449335039676",
            fromChainId: 5,
            fromTokenAddress: "0x0000000000000000000000000000000000000000",
            toChainId: 5,
            toTokenAddress: "0xb5B640E6414b6DeF4FC9B3C1EeF373925effeCcF",
            fromAddress: "0x27b4A938802b1278317eD0fC0135b6E1E14F43dC",
            toAddress: undefined,
        });


        expect(routes).to.not.be.undefined;
        expect(routes.routes?.length).to.be.greaterThan(0);
    });

    it("Should populate steps", async function () {
        const routes = await advancedAPI.advancedRoutesPost({
            fromAmount: "199699449335039676",
            fromChainId: 5,
            fromTokenAddress: "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C",
            toChainId: 5,
            toTokenAddress: "0xb5B640E6414b6DeF4FC9B3C1EeF373925effeCcF",
            fromAddress: "0x27b4A938802b1278317eD0fC0135b6E1E14F43dC",
            toAddress: undefined,
        });

        const step: Step = routes.routes?.[0].steps?.[0];

        expect(step).to.not.be.undefined;

        const populated = await advancedAPI.advancedStepTransactionPost(step);

        expect(populated).to.not.be.undefined;
        expect(populated.transactionRequest).to.not.be.undefined;
    });

    it("Should handle multiple steps", async function () {
        const routes1 = await advancedAPI.advancedRoutesPost({
            fromAmount: "100000000",
            fromChainId: 5,
            fromTokenAddress: "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C",
            toChainId: 5,
            toTokenAddress: "0x64Ef393b6846114Bad71E2cB2ccc3e10736b5716",
            fromAddress: "0x27b4A938802b1278317eD0fC0135b6E1E14F43dC",
            toAddress: undefined,
        });

        const routes2 = await advancedAPI.advancedRoutesPost({
            fromAmount: "199699449335039676",
            fromChainId: 5,
            fromTokenAddress: "0x0000000000000000000000000000000000000000",
            toChainId: 5,
            toTokenAddress: "0xb5B640E6414b6DeF4FC9B3C1EeF373925effeCcF",
            fromAddress: "0x27b4A938802b1278317eD0fC0135b6E1E14F43dC",
            toAddress: undefined,
        });

        const step1: Step = routes1.routes?.[0].steps?.[0];
        const step2: Step = routes2.routes?.[0].steps?.[0];

        // console.log(JSON.stringify(step1, null, 2));

        expect(step1).to.not.be.undefined;
        expect(step2).to.not.be.undefined;

        const populated1 = await advancedAPI.advancedStepTransactionPost(step1);
        const populated2 = await advancedAPI.advancedStepTransactionPost(step2);

        expect(populated1).to.not.be.undefined;
        expect(populated1.transactionRequest).to.not.be.undefined;

        expect(populated2).to.not.be.undefined;
        expect(populated2.transactionRequest).to.not.be.undefined;
    });

    it("Should handle serialized payloads", async function () {
        const payload = {
            "name": "app/consume.steps",
            "data": {
                "address": "0xce9Db12cbF8401E20EAfd089e1c9839487e49bD3",
                "id": "0x11a38017b2ba54cef75d84accac4a751358234916689588c070d32fa0a03303f",
                "remainingSteps": [
                    {
                        "action": {
                            "fromAddress": "0xce9Db12cbF8401E20EAfd089e1c9839487e49bD3",
                            "fromAmount": "100000000",
                            "fromChainId": 5,
                            "fromToken": {
                                "address": "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C",
                                "chainId": 5,
                                "coinKey": "USDC",
                                "decimals": 6,
                                "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
                                "name": "USD Coin",
                                "priceUSD": "1.000000000000000000",
                                "symbol": "USDC"
                            },
                            "slippage": 1.0,
                            "toAddress": "0x27b4A938802b1278317eD0fC0135b6E1E14F43dC",
                            "toChainId": 5,
                            "toToken": {
                                "address": "0x64Ef393b6846114Bad71E2cB2ccc3e10736b5716",
                                "chainId": 5,
                                "decimals": 18,
                                "name": "USDT",
                                "priceUSD": "1",
                                "symbol": "USDT"
                            }
                        },
                        "estimate": {
                            "approvalAddress": "0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE",
                            "executionDuration": 30,
                            "feeCosts": [
                                {
                                    "amount": "300000",
                                    "amountUSD": "0.30",
                                    "description": "Fee paid to the Liquidity Provider",
                                    "included": true,
                                    "name": "LP Fee",
                                    "percentage": "0.003",
                                    "token": {
                                        "address": "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C",
                                        "chainId": 5,
                                        "coinKey": "USDC",
                                        "decimals": 6,
                                        "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
                                        "name": "USD Coin",
                                        "priceUSD": "1.000000000000000000",
                                        "symbol": "USDC"
                                    }
                                }
                            ],
                            "fromAmount": "100000000",
                            "gasCosts": [
                                {
                                    "amount": "18550000",
                                    "amountUSD": "0.01",
                                    "estimate": "350000",
                                    "limit": "593000",
                                    "price": "53",
                                    "token": {
                                        "address": "0x0000000000000000000000000000000000000000",
                                        "chainId": 5,
                                        "coinKey": "ETH",
                                        "decimals": 18,
                                        "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
                                        "name": "ETH",
                                        "priceUSD": "1.000000000000000000",
                                        "symbol": "ETH"
                                    },
                                    "type": "SEND"
                                }
                            ],
                            "toAmount": "16237739823272",
                            "toAmountMin": "10",
                            "tool": "uniswap-gor"
                        },
                        "id": "e9c6e4ce-19ae-4058-b910-ba3d86f090c2",
                        "includedSteps": [
                            {
                                "action": {
                                    "fromAmount": "100000000",
                                    "fromChainId": 5,
                                    "fromToken": {
                                        "address": "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C",
                                        "chainId": 5,
                                        "coinKey": "USDC",
                                        "decimals": 6,
                                        "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
                                        "name": "USD Coin",
                                        "priceUSD": "1.000000000000000000",
                                        "symbol": "USDC"
                                    },
                                    "slippage": 0.005,
                                    "toChainId": 5,
                                    "toToken": {
                                        "address": "0x64Ef393b6846114Bad71E2cB2ccc3e10736b5716",
                                        "chainId": 5,
                                        "decimals": 18,
                                        "name": "USDT",
                                        "priceUSD": "1",
                                        "symbol": "USDT"
                                    }
                                },
                                "estimate": {
                                    "approvalAddress": "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
                                    "executionDuration": 30,
                                    "feeCosts": [
                                        {
                                            "amount": "300000",
                                            "amountUSD": "0.30",
                                            "description": "Fee paid to the Liquidity Provider",
                                            "included": true,
                                            "name": "LP Fee",
                                            "percentage": "0.003",
                                            "token": {
                                                "address": "0xD87Ba7A50B2E7E660f678A895E4B72E7CB4CCd9C",
                                                "chainId": 5,
                                                "coinKey": "USDC",
                                                "decimals": 6,
                                                "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
                                                "name": "USD Coin",
                                                "priceUSD": "1.000000000000000000",
                                                "symbol": "USDC"
                                            }
                                        }
                                    ],
                                    "fromAmount": "100000000",
                                    "gasCosts": [
                                        {
                                            "amount": "18550000",
                                            "amountUSD": "0.01",
                                            "estimate": "350000",
                                            "limit": "455000",
                                            "price": "53",
                                            "token": {
                                                "address": "0x0000000000000000000000000000000000000000",
                                                "chainId": 5,
                                                "coinKey": "ETH",
                                                "decimals": 18,
                                                "logoURI": "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
                                                "name": "ETH",
                                                "priceUSD": "1.000000000000000000",
                                                "symbol": "ETH"
                                            },
                                            "type": "SEND"
                                        }
                                    ],
                                    "toAmount": "16237739823272",
                                    "toAmountMin": "16156551124156",
                                    "tool": "uniswap-gor"
                                },
                                "id": "e541b6d5-8289-4c5e-b5bf-13f859ece606",
                                "tool": "uniswap-gor",
                                "toolDetails": {
                                    "key": "uniswap-gor",
                                    "logoURI": "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/uniswap.png",
                                    "name": "Uniswap"
                                },
                                "type": "swap"
                            }
                        ],
                        "integrator": "lifi-staging-api",
                        "tool": "uniswap-gor",
                        "toolDetails": {
                            "key": "uniswap-gor",
                            "logoURI": "https://raw.githubusercontent.com/lifinance/types/main/src/assets/icons/exchanges/uniswap.png",
                            "name": "Uniswap"
                        },
                        "type": "lifi"
                    }
                ]
            },
            "id": "01HHMRWM23RR42WHS14QQH3NTQ",
            "ts": 1702577983551
        };

        const lifi = new LiFi({
            integrator: 'MUWP',
            apiUrl: 'https://staging.li.quest/v1'
        })

        const tx = await lifi.getStepTransaction(payload.data.remainingSteps[0] as LifiStep);

        console.log(tx);

        expect(tx).to.not.be.undefined;
        expect(tx.transactionRequest).to.not.be.undefined;

        // const populated1 = await advancedAPI.advancedStepTransactionPost(payload.data.remainingSteps[0] as Step);

        // expect(populated1).to.not.be.undefined;
        // expect(populated1.transactionRequest).to.not.be.undefined;
    });
});