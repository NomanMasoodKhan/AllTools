export function registerErrorHandler(fastify) {
  fastify.setErrorHandler((error, _request, reply) => {
    if (error.validation) {
      return reply.status(400).send({ message: 'Validation failed.', issues: error.validation });
    }

    if (error.statusCode) {
      return reply.status(error.statusCode).send({ message: error.message });
    }

    fastify.log.error(error);
    return reply.status(500).send({ message: 'Internal server error.' });
  });
}
