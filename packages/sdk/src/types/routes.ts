import { z } from "zod";

export const AddressSchema = z.string().min(1);

export const TokenSchema = z.object({
  address: AddressSchema,
  chainId: z.number().int(),
  symbol: z.string().optional(),
  name: z.string().optional(),
  decimals: z.number().int(),
  logoURI: z.string().optional(),
  priceUSD: z.string().optional(),
});

export type Token = z.infer<typeof TokenSchema>;

export const StepActionSchema = z.object({
  fromAmount: z.string(),
  fromChainId: z.number().int(),
  fromToken: TokenSchema,
  toChainId: z.number().int(),
  toToken: TokenSchema,
  fromAddress: AddressSchema.optional(),
  toAddress: AddressSchema.optional(),
  slippage: z.number().optional(),
});

export const GasCostSchema = z.object({
  amount: z.string(),
  amountUSD: z.string().optional(),
  token: TokenSchema,
  type: z.string().optional(),
  price: z.string().optional(),
});

export const FeeCostSchema = z.object({
  amount: z.string(),
  amountUSD: z.string().optional(),
  included: z.boolean().optional(),
  name: z.string().optional(),
  percentage: z.string().optional(),
  token: TokenSchema.optional(),
  description: z.string().optional(),
});

export const StepEstimateSchema = z.object({
  approvalAddress: AddressSchema.optional(),
  fromAmount: z.string().optional(),
  toAmount: z.string().optional(),
  toAmountMin: z.string().optional(),
  tool: z.string().optional(),
  feeCosts: z.array(FeeCostSchema).optional(),
  executionDuration: z.number().optional(),
  gasCosts: z.array(GasCostSchema).optional(),
});

export const StepSchema = z.object({
  id: z.string(),
  type: z.string(),
  action: StepActionSchema,
  tool: z.string().optional(),
  toolDetails: z
    .object({
      key: z.string().optional(),
      name: z.string().optional(),
      logoURI: z.string().optional(),
    })
    .optional(),
  estimate: StepEstimateSchema.optional(),
  transactionRequest: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
});

export type Step = z.infer<typeof StepSchema>;

export const RouteSchema = z.object({
  id: z.string(),
  steps: z.array(StepSchema),
  fromAmount: z.string(),
  fromChainId: z.number().int(),
  fromAmountUSD: z.string().optional(),
  fromToken: TokenSchema,
  toAmount: z.string(),
  toAmountMin: z.string(),
  toAmountUSD: z.string().optional(),
  toChainId: z.number().int(),
  toToken: TokenSchema,
  containsSwitchChain: z.boolean().optional(),
  fromAddress: AddressSchema.optional(),
  toAddress: AddressSchema.optional(),
  gasCostUSD: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type Route = z.infer<typeof RouteSchema>;

export type RouteRecord = Record<string, Route[]>;

