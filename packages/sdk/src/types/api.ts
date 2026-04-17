import { z } from "zod";
import {
  AddressSchema,
  RouteSchema,
  StepSchema,
  TokenSchema,
} from "./routes";

export const TokenInputSchema = z.object({
  address: AddressSchema,
  value: z.string(),
  image: z.string().optional(),
});

export type TokenInput = z.infer<typeof TokenInputSchema>;

export const RouteOptionsSchema = z.object({
  allowBridges: z.array(z.string()).optional(),
  denyBridges: z.array(z.string()).optional(),
  allowExchanges: z.array(z.string()).optional(),
  denyExchanges: z.array(z.string()).optional(),
  integrator: z.string().optional(),
});

export type RouteOptions = z.infer<typeof RouteOptionsSchema>;

export const QuoteRequestSchema = z.object({
  inputTokens: z.array(TokenInputSchema).min(1),
  outputTokens: z.array(TokenInputSchema).min(1),
  distribution: z.array(z.number()).min(1),
  inputChain: z.number(),
  outputChain: z.number(),
  inputAmount: z.record(z.string()),
  fromAddress: AddressSchema,
  tempAccount: AddressSchema.optional(),
  toAddress: AddressSchema.optional(),
  options: RouteOptionsSchema.optional(),
});

export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;

export const QuoteResponseSchema = z.object({
  routes: z.record(z.array(RouteSchema)),
  tempAccount: AddressSchema,
  validUntil: z.number(),
});

export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;

export const InitiateRouteSchema = RouteSchema.extend({
  steps: z.array(StepSchema),
});

export const InitiateRequestSchema = z.object({
  from: z.record(z.record(z.string())),
  gasPayer: AddressSchema,
  account: AddressSchema,
  chainId: z.number(),
  routes: z.array(InitiateRouteSchema),
  maxFeePerGas: z.string().optional(),
  maxPriorityFeePerGas: z.string().optional(),
});

export type InitiateRequest = z.infer<typeof InitiateRequestSchema>;

export const TransactionPayloadSchema = z.object({
  to: AddressSchema.optional(),
  data: z.string().optional(),
  value: z.string().optional(),
  chainId: z.number().optional(),
  gas: z.string().optional(),
  type: z.string().optional(),
});

export const InitiateResponseSchema = z.object({
  status: z.string(),
  address: AddressSchema,
  txn: TransactionPayloadSchema,
  id: z.string(),
});

export type InitiateResponse = z.infer<typeof InitiateResponseSchema>;

export const ReceiveFundsRequestSchema = z.object({
  transactionHash: z.string(),
  chainId: z.number(),
  accountAddress: AddressSchema,
});

export const ReceiveFundsResponseSchema = z.object({
  status: z.string(),
});

export const ChainConfirmedRequestSchema = ReceiveFundsRequestSchema;
export const ChainConfirmedResponseSchema = ReceiveFundsResponseSchema;

export const StellarAssetSchema = z.object({
  code: z.string(),
  issuer: z.string(),
});

export type StellarAsset = z.infer<typeof StellarAssetSchema>;

export interface SwapSignerPayload {
  to?: string;
  data?: string;
  value?: string;
  chainId?: number;
}

export type SwapSigner = (payload: SwapSignerPayload) => Promise<string>;

