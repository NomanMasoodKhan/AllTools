import { buildAnalyticsController } from '../../controllers/v1/analytics.controller.js';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js';

export default async function analyticsRoutes(fastify) {
  const controller = buildAnalyticsController(fastify);

  fastify.get(
    '/developer/analytics',
    { preHandler: [requireAuth, requireRole(['developer'])] },
    controller.getDeveloperOverview
  );
}
