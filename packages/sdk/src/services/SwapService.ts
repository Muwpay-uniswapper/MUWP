import { RouteService } from "./RouteService";
import { WalletService } from "./WalletService";
import { StellarDexService } from "./StellarDexService";
import {
  InitiateResponse,
  QuoteRequest,
  QuoteResponse,
  SwapSigner,
} from "../types/api";
import { Route } from "../types/routes";
import { PerfTimer } from "../utils/perf";

export interface SwapQuoteInput extends QuoteRequest {
  ensureMultiInput?: boolean;
}

export interface ExecuteSwapInput {
  quote: QuoteResponse;
  chainId: number;
  gasPayer: string;
  signer: SwapSigner;
  routes?: Route[];
  from?: Record<string, Record<string, string>>;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  stellarSecret?: string;
  stellarAssetCode?: string;
  stellarIssuer?: string;
  stellarChainId?: number;
}

export interface SwapExecutionResult {
  initiate: InitiateResponse;
  transactionHash: string;
  receiveReceipt: { status: string };
  confirmationReceipt: { status: string };
  stellarSwap?: { hash: string; acceptedPrice: number };
  metrics: Record<string, number>;
}

export class SwapService {
  constructor(
    private readonly deps: {
      routeService: RouteService;
      walletService: WalletService;
      stellarDex: StellarDexService;
    },
  ) {}

  async quoteToStellar(input: SwapQuoteInput) {
    const requireMulti =
      typeof input.ensureMultiInput === "undefined" || input.ensureMultiInput;
    if (requireMulti && input.inputTokens.length < 2) {
      throw new Error("At least two input tokens required");
    }
    if (requireMulti && input.inputChain === 7) {
      throw new Error("Input chain must be non-Stellar for the prototype");
    }
    return this.deps.walletService.requestManagedWallet(input);
  }

  async executeSwap(input: ExecuteSwapInput): Promise<SwapExecutionResult> {
    const timer = new PerfTimer();
    const routes =
      input.routes ??
      this.deps.routeService.selectRoutes(input.quote.routes, {
        maxRoutes: Object.keys(input.quote.routes).length,
      });
    timer.start("initiate");
    const payload = this.deps.walletService.buildInitiatePayload({
      routes,
      account: input.quote.tempAccount,
      gasPayer: input.gasPayer,
      chainId: input.chainId,
      from: input.from,
      maxFeePerGas: input.maxFeePerGas,
      maxPriorityFeePerGas: input.maxPriorityFeePerGas,
    });
    const initiate = await this.deps.routeService.initiate(payload);
    timer.stop("initiate");
    timer.start("sign");
    const transactionHash = await input.signer(initiate.txn);
    timer.stop("sign");
    timer.start("notifyReceive");
    const receiveReceipt = await this.deps.routeService.notifyReceiveFunds({
      transactionHash,
      chainId: input.chainId,
      accountAddress: input.quote.tempAccount,
    });
    timer.stop("notifyReceive");
    timer.start("notifyConfirm");
    const confirmationReceipt = await this.deps.routeService.notifyChainConfirmed(
      {
        transactionHash,
        chainId: input.chainId,
        accountAddress: input.quote.tempAccount,
      },
    );
    timer.stop("notifyConfirm");
    let stellarSwap: SwapExecutionResult["stellarSwap"];
    if (input.stellarSecret && input.stellarAssetCode && input.stellarIssuer) {
      const stellarChainId = input.stellarChainId ?? 7;
      const total = routes
        .filter((route) => route.toChainId === stellarChainId)
        .reduce((sum, route) => sum + BigInt(route.toAmount), 0n)
        .toString();
      timer.start("stellarSwap");
      stellarSwap = await this.deps.stellarDex.swapToXlm({
        selling: {
          code: input.stellarAssetCode,
          issuer: input.stellarIssuer,
        },
        amount: total,
        accountSecret: input.stellarSecret,
      });
      timer.stop("stellarSwap");
    }
    return {
      initiate,
      transactionHash,
      receiveReceipt,
      confirmationReceipt,
      stellarSwap,
      metrics: timer.summary(),
    };
  }
}

