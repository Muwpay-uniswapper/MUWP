import { HttpClient } from "../http/HttpClient";
import {
  ChainConfirmedRequestSchema,
  ChainConfirmedResponseSchema,
  InitiateRequest,
  InitiateRequestSchema,
  InitiateResponse,
  InitiateResponseSchema,
  QuoteRequest,
  QuoteRequestSchema,
  QuoteResponse,
  QuoteResponseSchema,
  ReceiveFundsRequestSchema,
  ReceiveFundsResponseSchema,
} from "../types/api";
import { Route, RouteRecord } from "../types/routes";

export interface RouteSelectionOptions {
  maxRoutes?: number;
  preferTag?: string;
}

export class RouteService {
  constructor(private readonly http: HttpClient) {}

  async quote(input: QuoteRequest): Promise<QuoteResponse> {
    return this.http.request(
      "POST",
      "/api/quote",
      QuoteRequestSchema.parse(input),
      QuoteResponseSchema,
    );
  }

  selectRoutes(
    routes: RouteRecord,
    { maxRoutes = 1, preferTag = "RECOMMENDED" }: RouteSelectionOptions = {},
  ): Route[] {
    const flattened = Object.values(routes).flat();
    const sorted = flattened.sort((a, b) => {
      const aPreferred = a.tags?.includes(preferTag) ? 0 : 1;
      const bPreferred = b.tags?.includes(preferTag) ? 0 : 1;
      if (aPreferred !== bPreferred) {
        return aPreferred - bPreferred;
      }
      const aUsd = Number(a.toAmountUSD ?? "0");
      const bUsd = Number(b.toAmountUSD ?? "0");
      return bUsd - aUsd;
    });
    return sorted.slice(0, maxRoutes);
  }

  async initiate(input: InitiateRequest): Promise<InitiateResponse> {
    return this.http.request(
      "POST",
      "/api/initiate",
      InitiateRequestSchema.parse(input),
      InitiateResponseSchema,
    );
  }

  async notifyReceiveFunds(input: {
    transactionHash: string;
    chainId: number;
    accountAddress: string;
  }) {
    return this.http.request(
      "POST",
      "/api/receive-funds",
      ReceiveFundsRequestSchema.parse(input),
      ReceiveFundsResponseSchema,
    );
  }

  async notifyChainConfirmed(input: {
    transactionHash: string;
    chainId: number;
    accountAddress: string;
  }) {
    return this.http.request(
      "POST",
      "/api/chain-confirmed",
      ChainConfirmedRequestSchema.parse(input),
      ChainConfirmedResponseSchema,
    );
  }

  buildSenderMatrix(
    routes: Route[],
    owner: string,
    overrides?: Record<string, Record<string, string>>,
  ) {
    if (overrides) {
      return overrides;
    }
    return routes.reduce<Record<string, Record<string, string>>>(
      (acc, route) => {
        const token = route.fromToken.address;
        const amount = route.fromAmount;
        if (!acc[token]) {
          acc[token] = {};
        }
        acc[token][owner] = amount;
        return acc;
      },
      {},
    );
  }
}

