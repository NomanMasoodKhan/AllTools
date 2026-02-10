import authRoutes from './auth.routes.js';
import toolRoutes from './tool.routes.js';
import reviewRoutes from './review.routes.js';
import analyticsRoutes from './analytics.routes.js';

export default async function v1Routes(fastify) {
  fastify.get('/health', async () => {
    const result = await fastify.db.query('SELECT 1 AS ok');

    return {
      status: 'ok',
      database: result.rows[0]?.ok === 1 ? 'ok' : 'unknown'
    };
  });

  fastify.register(authRoutes);
  fastify.register(toolRoutes);
  fastify.register(reviewRoutes);
  fastify.register(analyticsRoutes);
}
