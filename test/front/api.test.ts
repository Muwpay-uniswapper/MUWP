import { createConfiguration, DefaultApi, AdvancedApi } from "../../lib/li.fi-ts";
import { expect } from "chai";
describe("Li.Fi API", function () {
    const config = createConfiguration();
    const api = new DefaultApi(config);
    const advancedAPI = new AdvancedApi(config);
    it("Should get a quote", async function () {
        const res = await api.quoteGet(1, 1, "ETH", "USDC", "0x492804d7740150378be8d4bbf8ce012c5497dea9", 1e18);

        expect(res).to.not.be.undefined;
    });

    it("Should fetch tokens", async function () {
        const res = await api.tokensGet("1");

        expect(res.tokens).to.not.be.undefined;
        expect(res.tokens?.length).to.be.greaterThan(0);
    });

    it("Should fetch routes", async function () {
        const routes = await advancedAPI.advancedRoutesPost({
            fromAmount: "1000000000000000000",
            fromChainId: 1,
            fromTokenAddress: "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
            toChainId: 56, // BSC
            toTokenAddress: "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
            fromAddress: "0x492804d7740150378be8d4bbf8ce012c5497dea9",
            toAddress: undefined,
        });


        expect(routes).to.not.be.undefined;
        expect(routes.routes?.length).to.be.greaterThan(0);
    });
});