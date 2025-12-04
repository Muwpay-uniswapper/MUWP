import { z } from "zod";
import {
  AddressSchema,
  EthereumAddressSchema
} from "./address";
import { RouteOptionsSchema } from "./route-options";
import { RouteSchema } from "./route";

const TokenReferenceSchema = z.object({
  address: z.string(),
  value: z.string(),
  image: z.string().optional()
});

export const QuoteInputSchema = z.object({
  inputTokens: z.array(TokenReferenceSchema).min(1),
  outputTokens: z.array(TokenReferenceSchema).min(1),
  distribution: z.array(z.number()).min(1),
  inputChain: z.number(),
  outputChain: z.number(),
  inputAmount: z.record(z.coerce.bigint()),
  fromAddress: EthereumAddressSchema,
  tempAccount: EthereumAddressSchema.optional(),
  toAddress: AddressSchema.optional(),
  options: RouteOptionsSchema.optional()
});

export const QuoteResponseSchema = z.object({
  routes: z.record(z.array(RouteSchema)),
  tempAccount: EthereumAddressSchema,
  validUntil: z.coerce.date()
});

export type QuoteInput = z.infer<typeof QuoteInputSchema>;
export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;

