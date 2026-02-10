import { z } from 'zod';

const uuidSchema = z.string().uuid();

export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(140).optional(),
  content: z.string().trim().min(10).max(4000)
});

export const toolIdParamSchema = z.object({
  toolId: uuidSchema
});
