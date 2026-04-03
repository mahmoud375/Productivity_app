import { z } from "zod";

export const createSubtaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255).trim(),
});

export const updateSubtaskSchema = z.object({
  title: z.string().min(1).max(255).trim().optional(),
  isCompleted: z.boolean().optional(),
});

export type CreateSubtaskInput = z.infer<typeof createSubtaskSchema>;
export type UpdateSubtaskInput = z.infer<typeof updateSubtaskSchema>;
