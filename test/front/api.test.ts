import * as lifi from "@/lib/li.fi-ts/";
import { expect } from "chai";
describe("Li.Fi API", function () {
    it("Should get a quote", async function () {
        const config = lifi.createConfiguration();
        const api = new lifi.DefaultApi(config);

        const res = await api.quoteGet(1, 1, "ETH", "USDC", "0x492804d7740150378be8d4bbf8ce012c5497dea9", 1e18);

        expect(res).to.not.be.undefined;
    });
});