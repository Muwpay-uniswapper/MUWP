import { z } from "zod";

export const AllowDenyPreferSchema = z.object({
  allow: z.array(z.string()).optional(),
  deny: z.array(z.string()).optional(),
  prefer: z.array(z.string()).optional()
});

export const RouteOptionsSchema = z.object({
  integrator: z.string().optional(),
  slippage: z.number().optional(),
  bridges: AllowDenyPreferSchema.optional(),
  exchanges: AllowDenyPreferSchema.optional(),
  order: z.enum(["RECOMMENDED", "FASTEST", "CHEAPEST", "SAFEST"]).optional(),
  allowSwitchChain: z.boolean().optional(),
  referrer: z.string().optional(),
  fee: z.number().optional(),
  maxPriceImpact: z.number().optional()
});

export type RouteOptions = z.infer<typeof RouteOptionsSchema>;

