import { z } from "zod";

export const createLeadSchema = z.object({
  source: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
  vehicleInterest: z.string().optional(),
  notes: z.string().optional(),
});

export const updateLeadSchema = z.object({
  status: z.enum(["NEW", "CONTACTED", "QUALIFIED", "LOST"]).optional(),
  assignedToId: z.string().optional(),
  notes: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  name: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
