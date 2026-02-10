import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';

async function jwtPlugin(fastify) {
  await fastify.register(jwt, {
    secret: fastify.config.jwtSecret,
    sign: {
      expiresIn: fastify.config.jwtExpiresIn,
      issuer: fastify.config.jwtIssuer,
      audience: fastify.config.jwtAudience
    },
    verify: {
      issuer: fastify.config.jwtIssuer,
      audience: fastify.config.jwtAudience
    }
  });
}

export default fp(jwtPlugin, { name: 'jwt-plugin' });
