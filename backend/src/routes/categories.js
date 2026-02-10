export default async function categoryRoutes(fastify) {
  fastify.get('/categories', async () => {
    const result = await fastify.db.query(
      'SELECT id, name, slug FROM categories ORDER BY name ASC'
    );

    return { categories: result.rows };
  });
}
