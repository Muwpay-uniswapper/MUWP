// ─── Core config & HTTP ────────────────────────────────────────────────────
export {
  resolveBaseSdkConfig,
  withBase,
  type BaseSdkConfig,
  type FetchImplementation,
  type ResolvedSdkConfig,
} from "./config";
export { HttpClient, type HttpClientOptions, type HttpRequestConfig } from "./http/client";

// ─── Services ──────────────────────────────────────────────────────────────
// Primary services (new implementation)
export * from "./services/asset";
export * from "./services/wallet";
export * from "./services/StellarDexService";
export * from "./services/SorobanSubscriptionService";
export * from "./types/subscription";

// Swap & routing services
export * from "./services/RouteService";
export * from "./services/SwapService";

// ─── Types ─────────────────────────────────────────────────────────────────
// New type system
export * from "./types";

// Legacy types needed by RouteService / SwapService public API
export type {
  StellarAsset,
  SwapSigner,
  SwapSignerPayload,
  InitiateRequest,
  InitiateResponse,
  QuoteRequest,
} from "./types/api";

// ─── MuwpSdk — primary entry point ─────────────────────────────────────────
import { resolveBaseSdkConfig, type ResolvedSdkConfig } from "./config";
import { HttpClient, type HttpClientOptions } from "./http/client";
import { WalletService } from "./services/wallet";
import { StellarAssetService, type StellarAssetServiceOptions } from "./services/asset";

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
    this.config = resolveBaseSdkConfig(httpOptions);
    this.wallets = new WalletService(this.http);
    this.assets = new StellarAssetService(assetOptions);
  }

  get resolvedConfig(): ResolvedSdkConfig {
    return this.config;
  }

  async ping(): Promise<boolean> {
    const res = await this.http.request<{ status?: string }>({
      method: "GET",
      path: "/api/status",
    });
    return typeof res === "object";
  }
}

export function createMuwpSdk(options?: MuwpSdkOptions): MuwpSdk {
  return new MuwpSdk(options);
}
