import fp from 'fastify-plugin';
import pg from 'pg';

const { Pool } = pg;

async function dbPlugin(fastify) {
  const pool = new Pool({ connectionString: fastify.config.databaseUrl });

  fastify.decorate('db', pool);

  fastify.addHook('onClose', async () => {
    await pool.end();
  });
}

export default fp(dbPlugin, { name: 'db-plugin' });
