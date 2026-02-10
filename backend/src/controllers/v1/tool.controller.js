import {
  approveToolSchema,
  createToolSchema,
  toolIdParamSchema
} from '../../schemas/tool.schema.js';
import { getPendingTools, moderateTool, submitTool } from '../../services/v1/tool.service.js';

export function buildToolController(fastify) {
  return {
    async submit(request, reply) {
      const parsed = createToolSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.code(400).send({
          message: 'Invalid tool submission payload.',
          issues: parsed.error.issues
        });
      }

      const tool = await submitTool(fastify.db, request.user, parsed.data);

      return reply.code(201).send({
        message: 'Tool submitted successfully and is pending approval.',
        tool
      });
    },

    async listPending(_request, reply) {
      const tools = await getPendingTools(fastify.db);

      return reply.send({
        tools,
        count: tools.length
      });
    },

    async approve(request, reply) {
      const paramsParsed = toolIdParamSchema.safeParse(request.params);
      if (!paramsParsed.success) {
        return reply.code(400).send({
          message: 'Invalid toolId parameter.',
          issues: paramsParsed.error.issues
        });
      }

      const bodyParsed = approveToolSchema.safeParse(request.body);
      if (!bodyParsed.success) {
        return reply.code(400).send({
          message: 'Invalid approval payload.',
          issues: bodyParsed.error.issues
        });
      }

      const approval = await moderateTool(
        fastify.db,
        request.user,
        paramsParsed.data.toolId,
        bodyParsed.data
      );

      return reply.send({
        message: 'Tool moderation decision recorded.',
        approval
      });
    }
  };
}
