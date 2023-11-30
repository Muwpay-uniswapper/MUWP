import { createConfiguration, DefaultApi, AdvancedApi, server2 } from "../../lib/li.fi-ts";
import { expect } from "chai";
describe("Li.Fi API", function () {
    const config = createConfiguration({
        baseServer: server2
    });
    const api = new DefaultApi(config);
    const advancedAPI = new AdvancedApi(config);
    // it("Should get a quote", async function () {
    //     const res = await api.quoteGet("1", "1", "ETH", "USDC", "0x492804d7740150378be8d4bbf8ce012c5497dea9", 1e18);

    //     expect(res).to.not.be.undefined;
    // });

    // it("Should fetch tokens", async function () {
    //     const res = await api.tokensGet("1");

    //     expect(res.tokens).to.not.be.undefined;
    //     expect(res.tokens?.length).to.be.greaterThan(0);
    // });

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
});