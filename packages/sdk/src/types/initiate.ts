import { z } from "zod";
import { EthereumAddressSchema } from "./address";
import { RouteSchema } from "./route";

export const InitiateInputSchema = z.object({
  from: z.record(EthereumAddressSchema, z.record(EthereumAddressSchema, z.coerce.bigint())),
  gasPayer: EthereumAddressSchema,
  account: EthereumAddressSchema,
  chainId: z.number(),
  routes: z.array(RouteSchema),
  maxFeePerGas: z.coerce.bigint().optional(),
  maxPriorityFeePerGas: z.coerce.bigint().optional()
});

export const InitiateResponseSchema = z.object({
  status: z.literal("success"),
  address: z.string(),
  txn: z.unknown(),
  id: z.string()
});

export type InitiateInput = z.infer<typeof InitiateInputSchema>;
export type InitiateResponse = z.infer<typeof InitiateResponseSchema>;

