import fetch from "cross-fetch";
import { ZodSchema } from "zod";
import { retry } from "../utils/retry";

export interface HttpClientOptions {
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
}

export class HttpClient {
  private readonly baseUrl: string;
  private readonly headers: Record<string, string>;
  private readonly timeout: number;
  private readonly retries: number;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.headers = options.defaultHeaders ?? {};
    this.timeout = options.timeoutMs ?? 15000;
    this.retries = options.retries ?? 2;
  }

  async request<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown,
    schema?: ZodSchema<T>,
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const exec = async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), this.timeout);
      const init: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...this.headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      };
      try {
        const res = await fetch(url, init);
        if (!res.ok) {
          const text = await res.text();
          throw new Error(
            `Request failed with ${res.status} ${res.statusText}: ${text}`,
          );
        }
        const payload = (await res.json()) as unknown;
        return schema ? schema.parse(payload) : (payload as T);
      } finally {
        clearTimeout(timer);
      }
    };
    return retry(exec, { retries: this.retries });
  }
}

