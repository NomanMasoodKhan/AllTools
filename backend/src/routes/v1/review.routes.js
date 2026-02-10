import { buildReviewController } from '../../controllers/v1/review.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

export default async function reviewRoutes(fastify) {
  const controller = buildReviewController(fastify);

  fastify.get('/tools/:toolId/reviews', controller.list);
  fastify.post('/tools/:toolId/reviews', { preHandler: [requireAuth] }, controller.create);
}
