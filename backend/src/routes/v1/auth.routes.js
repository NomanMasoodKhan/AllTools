import { buildAuthController } from '../../controllers/v1/auth.controller.js';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js';

export default async function authRoutes(fastify) {
  const controller = buildAuthController(fastify);

  fastify.post('/auth/register', controller.register);
  fastify.post('/auth/login', controller.login);

  fastify.get('/auth/me', { preHandler: [requireAuth] }, controller.me);

  fastify.get(
    '/protected/admin',
    { preHandler: [requireAuth, requireRole(['admin'])] },
    controller.adminOnly
  );
}
