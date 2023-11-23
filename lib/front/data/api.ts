import { DefaultApi, createConfiguration, AdvancedApi } from "@/lib/li.fi-ts";

const config = createConfiguration();
const api = new DefaultApi(config);
export const advancedAPI = new AdvancedApi(config);
export default api;