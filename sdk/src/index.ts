export * from "./client";
export * from "./config";
export * from "./services/RouteService";
export * from "./services/WalletService";
export * from "./services/AssetService";
export * from "./services/StellarDexService";
export * from "./services/SwapService";
export * from "./types/api";
export * from "./types/routes";
import { resolveConfig, type ResolvedSdkConfig } from "./config";
import { HttpClient, type HttpClientOptions } from "./http/client";
import {
  StellarAssetService,
  type StellarAssetServiceOptions,
  WalletService
} from "./services";

export interface MuwpSdkOptions extends HttpClientOptions {
  assetOptions?: StellarAssetServiceOptions;
}

export class MuwpSdk {
  private readonly http: HttpClient;
  private readonly config: ResolvedSdkConfig;
  readonly wallets: WalletService;
  readonly assets: StellarAssetService;

  constructor(options: MuwpSdkOptions = {}) {
    const { assetOptions, ...httpOptions } = options;
    this.http = new HttpClient(httpOptions);
    this.config = resolveConfig(httpOptions);
    this.wallets = new WalletService(this.http);
    this.assets = new StellarAssetService(assetOptions);
  }

  get resolvedConfig(): ResolvedSdkConfig {
    return this.config;
  }

  async ping(): Promise<boolean> {
    const res = await this.http.request<{ status?: string }>({
      method: "GET",
      path: "/api/status"
    });
    return typeof res === "object";
  }
}

export function createMuwpSdk(config?: MuwpSdkOptions) {
  return new MuwpSdk(config);
}

export * from "./config";
export * from "./http/client";
export * from "./types";
export * from "./services";

