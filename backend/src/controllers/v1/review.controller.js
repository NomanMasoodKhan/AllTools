import { createReviewSchema, toolIdParamSchema } from '../../schemas/review.schema.js';
import { getPublicToolReviews, submitReview } from '../../services/v1/review.service.js';

export function buildReviewController(fastify) {
  return {
    async create(request, reply) {
      const paramsParsed = toolIdParamSchema.safeParse(request.params);
      if (!paramsParsed.success) {
        return reply.code(400).send({
          message: 'Invalid toolId parameter.',
          issues: paramsParsed.error.issues
        });
      }

      const bodyParsed = createReviewSchema.safeParse(request.body);
      if (!bodyParsed.success) {
        return reply.code(400).send({
          message: 'Invalid review payload.',
          issues: bodyParsed.error.issues
        });
      }

      const review = await submitReview(
        fastify.db,
        request.user,
        paramsParsed.data.toolId,
        bodyParsed.data
      );

      return reply.code(201).send({
        message: 'Review submitted successfully.',
        review
      });
    },

    async list(request, reply) {
      const paramsParsed = toolIdParamSchema.safeParse(request.params);
      if (!paramsParsed.success) {
        return reply.code(400).send({
          message: 'Invalid toolId parameter.',
          issues: paramsParsed.error.issues
        });
      }

      const reviews = await getPublicToolReviews(fastify.db, paramsParsed.data.toolId);

      return reply.send({
        tool_id: paramsParsed.data.toolId,
        count: reviews.length,
        reviews
      });
    }
  };
}
