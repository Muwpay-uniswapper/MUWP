import { DefaultApi, createConfiguration, AdvancedApi, server1, server2, SecurityAuthentication, RequestContext } from "@/lib/li.fi-ts";

class LiFiAuth implements SecurityAuthentication {
    getName(): string {
        return "LiFiAuth"
    }
    applySecurityAuthentication(context: RequestContext): void | Promise<void> {
        if (process.env.NODE_ENV === "production" || process.env.LIFI_API_KEY) {
            context.setHeaderParam("x-lifi-api-key", process.env.LIFI_API_KEY ?? "");
        }
    }
}

const config = createConfiguration({
    baseServer: (process.env.NODE_ENV === "production" || process.env.LIFI_API_KEY) ? server1 : server2,
    authMethods: {
        default: new LiFiAuth()
    }
});
const api = new DefaultApi(config);
export const advancedAPI = new AdvancedApi(config);
export default api;