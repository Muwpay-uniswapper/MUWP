import { z } from "zod";
import {
  resolveConfig,
  type BaseSdkConfig,
  type FetchImplementation,
  withBase
} from "../config";

export interface HttpRequestConfig<T> {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  schema?: z.ZodSchema<T>;
  searchParams?: Record<string, string | number | undefined>;
}

export interface HttpClientOptions extends BaseSdkConfig {
  retries?: number;
  retryDelayMs?: number;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly fetcher: FetchImplementation;
  private readonly retries: number;
  private readonly retryDelayMs: number;

  constructor(options: HttpClientOptions = {}) {
    const config = resolveConfig(options);
    this.baseUrl = config.baseUrl;
    this.apiKey = config.apiKey;
    this.fetcher = config.fetch;
    this.retries = Math.max(0, options.retries ?? 2);
    this.retryDelayMs = options.retryDelayMs ?? 250;
  }

  async request<T>(config: HttpRequestConfig<T>): Promise<T> {
    const url = this.createUrl(config.path, config.searchParams);
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...config.headers
    };
    if (this.apiKey) {
      headers["x-api-key"] = this.apiKey;
    }
    const body =
      typeof config.body === "undefined"
        ? undefined
        : JSON.stringify(config.body, (_, value) =>
            typeof value === "bigint" ? value.toString() : value
          );
    if (body) {
      headers["Content-Type"] = "application/json";
    }

    const attempt = async (tryIndex: number): Promise<Response> => {
      const res = await this.fetcher(url, {
        method: config.method,
        headers,
        body
      });
      if (res.ok) {
        return res;
      }
      if (tryIndex >= this.retries || !this.isRetryable(res.status)) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
      }
      await this.delay(this.retryDelayMs * (tryIndex + 1));
      return attempt(tryIndex + 1);
    };

    const response = await attempt(0);
    const json = (await response.json()) as unknown;
    if (!config.schema) {
      return json as T;
    }
    return config.schema.parse(json);
  }

  private createUrl(
    path: string,
    searchParams?: Record<string, string | number | undefined>
  ) {
    const url = new URL(withBase(path, this.baseUrl));
    if (searchParams) {
      Object.entries(searchParams).forEach(([key, value]) => {
        if (typeof value !== "undefined") {
          url.searchParams.set(key, String(value));
        }
      });
    }
    return url.toString();
  }

  private isRetryable(status: number) {
    return status >= 500 || status === 429;
  }

  private async delay(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}

