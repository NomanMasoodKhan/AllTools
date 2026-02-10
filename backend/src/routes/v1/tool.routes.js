import { buildToolController } from '../../controllers/v1/tool.controller.js';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js';

export default async function toolRoutes(fastify) {
  const controller = buildToolController(fastify);

  fastify.post(
    '/tools',
    { preHandler: [requireAuth, requireRole(['developer'])] },
    controller.submit
  );

  fastify.post(
    '/tools/:toolId/approve',
    { preHandler: [requireAuth, requireRole(['admin'])] },
    controller.approve
  );

  fastify.get('/tools/public', async () => {
    const result = await fastify.db.query(
      `SELECT id, name, short_description, tool_type, pricing_model, version, published_at
       FROM tools
       WHERE approval_status = 'approved'
         AND publication_status = 'published'
       ORDER BY published_at DESC NULLS LAST`
    );

    return { tools: result.rows };
  });
}
