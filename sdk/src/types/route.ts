import { z } from "zod";
import { TokenSchema, type Token } from "./token";

export const GasCostSchema = z.object({
  type: z.string(),
  price: z.string().optional(),
  estimate: z.string().optional(),
  limit: z.string().optional(),
  amount: z.string(),
  amountUSD: z.string().optional(),
  token: TokenSchema
});

export const FeeCostSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  percentage: z.string(),
  token: TokenSchema,
  amount: z.string().optional(),
  amountUSD: z.string(),
  included: z.boolean()
});

export const ActionSchema = z.object({
  fromChainId: z.number(),
  fromAmount: z.string(),
  fromToken: TokenSchema,
  toChainId: z.number(),
  toToken: TokenSchema,
  slippage: z.number().optional(),
  fromAddress: z.string().optional(),
  toAddress: z.string().optional()
});

export const EstimateSchema = z.object({
  fromAmount: z.string(),
  toAmount: z.string(),
  toAmountMin: z.string(),
  approvalAddress: z.string(),
  feeCosts: z.array(FeeCostSchema).optional(),
  gasCosts: z.array(GasCostSchema).optional(),
  executionDuration: z.number(),
  tool: z.string(),
  data: z.unknown().optional()
});

export const ToolDetailsSchema = z.object({
  key: z.string(),
  name: z.string().optional(),
  logoURI: z.string().optional()
});

export interface Step {
  id: string;
  type: string;
  tool: string;
  action: z.infer<typeof ActionSchema>;
  estimate?: z.infer<typeof EstimateSchema>;
  integrator?: string;
  referrer?: string;
  execution?: unknown;
  transactionRequest?: unknown;
  includedSteps?: Step[];
  toolDetails: z.infer<typeof ToolDetailsSchema>;
}

export const StepSchema: z.ZodType<Step> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.string(),
    tool: z.string(),
    action: ActionSchema,
    estimate: EstimateSchema.optional(),
    integrator: z.string().optional(),
    referrer: z.string().optional(),
    execution: z.unknown().nullable().optional(),
    transactionRequest: z.unknown().nullable().optional(),
    includedSteps: z.array(StepSchema).optional(),
    toolDetails: ToolDetailsSchema
  })
);

export const RouteSchema = z.object({
  id: z.string(),
  fromChainId: z.number(),
  fromAmountUSD: z.string(),
  fromAmount: z.string(),
  fromToken: TokenSchema,
  toChainId: z.number(),
  toAmountUSD: z.string(),
  toAmount: z.string(),
  toAmountMin: z.string(),
  toToken: TokenSchema,
  gasCostUSD: z.string().optional(),
  steps: z.array(StepSchema),
  fromAddress: z.string().optional(),
  toAddress: z.string().optional(),
  containsSwitchChain: z.boolean().optional(),
  tags: z.array(z.string()).optional()
});

export type GasCost = z.infer<typeof GasCostSchema>;
export type FeeCost = z.infer<typeof FeeCostSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Estimate = z.infer<typeof EstimateSchema>;
export type ToolDetails = z.infer<typeof ToolDetailsSchema>;
export type Route = z.infer<typeof RouteSchema>;
