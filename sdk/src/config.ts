import { HttpClient } from "./http/HttpClient";

export interface MuwpClientConfig {
  baseUrl?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
  stellar?: {
    horizonUrl?: string;
    networkPassphrase?: string;
  };
}

export const defaultConfig: Required<Omit<MuwpClientConfig, "stellar">> & {
  stellar: { horizonUrl: string; networkPassphrase: string };
} = {
  baseUrl: "https://muwp.xyz",
  headers: {},
  timeoutMs: 20000,
  retries: 2,
  stellar: {
    horizonUrl: "https://horizon.stellar.org",
    networkPassphrase: "Public Global Stellar Network ; September 2015",
  },
};

export function resolveConfig(config: MuwpClientConfig = {}) {
  return {
    ...defaultConfig,
    ...config,
    stellar: {
      ...defaultConfig.stellar,
      ...(config.stellar ?? {}),
    },
  };
}

export function createHttpClient(config: MuwpClientConfig): HttpClient {
  const merged = resolveConfig(config);
  return new HttpClient({
    baseUrl: merged.baseUrl ?? defaultConfig.baseUrl,
    defaultHeaders: merged.headers,
    timeoutMs: merged.timeoutMs,
    retries: merged.retries,
  });
}
import type { RequestInit } from "cross-fetch";
import fetchImpl from "cross-fetch";

export type FetchImplementation = (
  input: string | URL,
  init?: RequestInit
) => Promise<Response>;

export interface BaseSdkConfig {
  baseUrl?: string;
  apiKey?: string;
  fetch?: FetchImplementation;
}

const DEFAULT_BASE_URL = "https://muwp.xyz";

export type ResolvedSdkConfig = Required<Pick<BaseSdkConfig, "baseUrl">> &
  Omit<BaseSdkConfig, "baseUrl"> & {
    fetch: FetchImplementation;
  };

export function resolveConfig(config: BaseSdkConfig = {}): ResolvedSdkConfig {
  return {
    baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
    apiKey: config.apiKey,
    fetch: config.fetch ?? (fetchImpl as FetchImplementation)
  };
}

export function withBase(path: string, baseUrl: string): string {
  return new URL(path, baseUrl).toString();
}

