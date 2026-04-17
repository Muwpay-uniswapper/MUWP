import { HttpClient } from "../http/client";
import {
  QuoteInputSchema,
  QuoteResponseSchema,
  type QuoteInput,
  type QuoteResponse
} from "../types";

export interface WalletRecord {
  tempAccount: string;
  validUntil: Date;
  routes: QuoteResponse["routes"];
  input: QuoteInput;
}

export class WalletService {
  private readonly http: HttpClient;
  private readonly cache = new Map<string, WalletRecord>();

  constructor(http: HttpClient) {
    this.http = http;
  }

  async fetchQuote(input: QuoteInput): Promise<QuoteResponse> {
    const payload = QuoteInputSchema.parse(input);
    const response = await this.http.request({
      method: "POST",
      path: "/api/quote",
      body: payload,
      schema: QuoteResponseSchema
    });
    this.cache.set(response.tempAccount.toLowerCase(), {
      tempAccount: response.tempAccount,
      validUntil: response.validUntil,
      routes: response.routes,
      input: payload
    });
    return response;
  }

  async ensureTempAccount(input: QuoteInput): Promise<string> {
    const res = await this.fetchQuote(input);
    return res.tempAccount;
  }

  getAccount(tempAccount: string): WalletRecord | undefined {
    return this.cache.get(tempAccount.toLowerCase());
  }

  getTrackedAccounts(): WalletRecord[] {
    return Array.from(this.cache.values());
  }

  clearAccounts() {
    this.cache.clear();
  }
}

