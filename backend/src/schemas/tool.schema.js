import { z } from 'zod';

const uuidSchema = z.string().uuid();

export const createToolSchema = z.object({
  name: z.string().min(3).max(120),
  short_description: z.string().min(10).max(280),
  long_description: z.string().min(30).max(5000),
  category_ids: z.array(uuidSchema).min(1),
  tool_type: z.enum(['script', 'saas', 'rule_pack', 'framework']),
  supported_platforms: z.array(z.string().min(2).max(50)).min(1).max(20),
  deployment_type: z.string().min(2).max(60),
  pricing_model: z.enum(['free', 'paid', 'freemium']),
  documentation_url: z.string().url().max(1024),
  version: z.string().min(1).max(40)
});

export const approveToolSchema = z
  .object({
    decision: z.enum(['approved', 'rejected']),
    reason: z.string().trim().min(3).max(2000).optional()
  })
  .superRefine((value, ctx) => {
    if (value.decision === 'rejected' && !value.reason) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'reason is required when decision is rejected.',
        path: ['reason']
      });
    }
  });

export const toolIdParamSchema = z.object({
  toolId: uuidSchema
});
