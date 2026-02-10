import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';

async function authPlugin(fastify) {
  await fastify.register(jwt, {
    secret: fastify.config.jwtSecret
  });

  fastify.decorate('authenticate', async function authenticate(request, reply) {
    try {
      await request.jwtVerify();
    } catch {
      reply.code(401).send({ message: 'Authentication required.' });
    }
  });
}

export default fp(authPlugin, { name: 'auth-plugin' });
