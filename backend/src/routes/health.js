export default async function healthRoutes(fastify) {
  fastify.get('/health', async () => {
    const dbStatus = await fastify.db.query('SELECT 1 AS ok');

    return {
      status: 'ok',
      database: dbStatus.rows[0]?.ok === 1 ? 'ok' : 'unknown'
    };
  });
}
