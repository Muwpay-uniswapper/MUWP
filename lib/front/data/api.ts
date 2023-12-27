import { DefaultApi, createConfiguration, AdvancedApi, server1, server2 } from "@/lib/li.fi-ts";

const config = createConfiguration({
    baseServer: server2 // process.env.NODE_ENV === "production" ? server1 : server2
});
const api = new DefaultApi(config);
export const advancedAPI = new AdvancedApi(config);
export default api;