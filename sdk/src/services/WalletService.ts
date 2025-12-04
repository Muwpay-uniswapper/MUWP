import {
  InitiateRequest,
  QuoteRequest,
  QuoteResponse,
} from "../types/api";
import { Route } from "../types/routes";
import { RouteService } from "./RouteService";

interface WalletCacheEntry {
  routes: QuoteResponse["routes"];
  validUntil: number;
}

export class WalletService {
  private readonly cache = new Map<string, WalletCacheEntry>();

  constructor(private readonly routeService: RouteService) {}

  async requestManagedWallet(input: QuoteRequest) {
    const quote = await this.routeService.quote(input);
    this.cache.set(quote.tempAccount, {
      routes: quote.routes,
      validUntil: quote.validUntil,
    });
    return quote;
  }

  getCachedRoutes(account: string) {
    const entry = this.cache.get(account);
    if (!entry) {
      throw new Error("Wallet not cached");
    }
    if (entry.validUntil < Date.now()) {
      throw new Error("Cached wallet expired");
    }
    return entry.routes;
  }

  buildInitiatePayload(params: {
    routes: Route[];
    account: string;
    gasPayer: string;
    chainId: number;
    from?: Record<string, Record<string, string>>;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  }): InitiateRequest {
    const fromMatrix = this.routeService.buildSenderMatrix(
      params.routes,
      params.gasPayer,
      params.from,
    );
    return {
      from: fromMatrix,
      gasPayer: params.gasPayer,
      account: params.account,
      chainId: params.chainId,
      routes: params.routes,
      maxFeePerGas: params.maxFeePerGas,
      maxPriorityFeePerGas: params.maxPriorityFeePerGas,
    };
  }
}

