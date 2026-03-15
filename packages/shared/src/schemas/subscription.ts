import { z } from "zod";

export const createSubscriptionSchema = z.object({
  plan: z.enum(["CHECK_MY_DEAL", "VIP_CONCIERGE"]),
  billingInterval: z.enum(["monthly", "yearly"]).optional(),
  amount: z.number().nonnegative().optional(),
});

export const dealAnalysisSchema = z.object({
  vehicle: z.record(z.unknown()).optional(),
  financing: z.record(z.unknown()).optional(),
  shipping: z.record(z.unknown()).optional(),
  addOns: z.record(z.unknown()).optional(),
  totalAmount: z.number().optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type DealAnalysisInput = z.infer<typeof dealAnalysisSchema>;
