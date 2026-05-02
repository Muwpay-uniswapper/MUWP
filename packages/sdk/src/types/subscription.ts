import { z } from "zod";

export const SubscriptionSchema = z.object({
  id: z.number(),
  subscriber: z.string(),
  token: z.string(),
  recipient: z.string(),
  amount: z.bigint(),
  interval: z.number(),
  nextPayment: z.number(),
  active: z.boolean(),
});

export type Subscription = z.infer<typeof SubscriptionSchema>;

export const CreateSubscriptionParamsSchema = z.object({
  contractId: z.string(),
  callerSecret: z.string(),
  token: z.string(),
  recipient: z.string(),
  amount: z.bigint(),
  intervalSeconds: z.number().int().positive(),
});

export type CreateSubscriptionParams = z.infer<
  typeof CreateSubscriptionParamsSchema
>;

export const TriggerPaymentParamsSchema = z.object({
  contractId: z.string(),
  callerSecret: z.string(),
  subscriptionId: z.number(),
});

export type TriggerPaymentParams = z.infer<typeof TriggerPaymentParamsSchema>;

export const CancelSubscriptionParamsSchema = z.object({
  contractId: z.string(),
  subscriberSecret: z.string(),
  subscriptionId: z.number(),
});

export type CancelSubscriptionParams = z.infer<
  typeof CancelSubscriptionParamsSchema
>;
