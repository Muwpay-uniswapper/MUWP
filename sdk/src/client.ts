import {
  createHttpClient,
  MuwpClientConfig,
  resolveConfig,
} from "./config";
import { HttpClient } from "./http/HttpClient";
import { RouteService } from "./services/RouteService";
import { WalletService } from "./services/WalletService";
import { AssetService } from "./services/AssetService";
import { StellarDexService } from "./services/StellarDexService";
import { SwapService } from "./services/SwapService";

export class MuwpClient {
  readonly config: ReturnType<typeof resolveConfig>;
  readonly http: HttpClient;
  readonly routes: RouteService;
  readonly wallets: WalletService;
  readonly assets: AssetService;
  readonly stellarDex: StellarDexService;
  readonly swaps: SwapService;

  constructor(config: MuwpClientConfig = {}) {
    this.config = resolveConfig(config);
    this.http = createHttpClient(this.config);
    this.routes = new RouteService(this.http);
    this.wallets = new WalletService(this.routes);
    this.assets = new AssetService(this.config.stellar);
    this.stellarDex = new StellarDexService(this.config.stellar);
    this.swaps = new SwapService({
      routeService: this.routes,
      walletService: this.wallets,
      stellarDex: this.stellarDex,
    });
  }
}

