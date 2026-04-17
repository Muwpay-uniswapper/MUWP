import fetchImpl from "cross-fetch";

export type FetchImplementation = (
  input: string | URL,
  init?: globalThis.RequestInit
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

export function resolveBaseSdkConfig(config: BaseSdkConfig = {}): ResolvedSdkConfig {
  return {
    baseUrl: config.baseUrl ?? DEFAULT_BASE_URL,
    apiKey: config.apiKey,
    fetch: config.fetch ?? (fetchImpl as FetchImplementation)
  };
}

export function withBase(path: string, baseUrl: string): string {
  return new URL(path, baseUrl).toString();
}
