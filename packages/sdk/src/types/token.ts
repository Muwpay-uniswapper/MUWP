import { z } from "zod";

export const TokenSchema = z.object({
  address: z.string(),
  chainId: z.number(),
  decimals: z.number(),
  symbol: z.string(),
  name: z.string().optional(),
  logoURI: z.string().optional(),
  coinKey: z.string().optional(),
  priceUSD: z.string().optional()
});

export type Token = z.infer<typeof TokenSchema>;

