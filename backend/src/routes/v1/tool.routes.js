import { buildToolController } from '../../controllers/v1/tool.controller.js';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js';

export default async function toolRoutes(fastify) {
  const controller = buildToolController(fastify);

  fastify.post(
    '/tools',
    { preHandler: [requireAuth, requireRole(['developer'])] },
    controller.submit
  );

  fastify.get(
    '/admin/tools/pending',
    { preHandler: [requireAuth, requireRole(['admin'])] },
    controller.listPending
  );

  fastify.post(
    '/tools/:toolId/approve',
    { preHandler: [requireAuth, requireRole(['admin'])] },
    controller.approve
  );

  fastify.get('/tools/public', controller.listPublic);
}
