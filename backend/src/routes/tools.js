import { z } from 'zod';

const toolQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0)
});

export default async function toolRoutes(fastify) {
  fastify.get('/tools', async (request, reply) => {
    const parseResult = toolQuerySchema.safeParse(request.query);

    if (!parseResult.success) {
      return reply.badRequest('Invalid query string.', {
        issues: parseResult.error.issues
      });
    }

    const { category, search, limit, offset } = parseResult.data;

    const values = [];
    const filters = [];

    if (category) {
      values.push(category);
      filters.push(`c.slug = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      filters.push(`(t.name ILIKE $${values.length} OR t.short_description ILIKE $${values.length})`);
    }

    values.push(limit);
    const limitPlaceholder = `$${values.length}`;

    values.push(offset);
    const offsetPlaceholder = `$${values.length}`;

    const whereClause = filters.length > 0 ? `WHERE ${filters.join(' AND ')}` : '';

    const query = `
      SELECT DISTINCT
        t.id,
        t.name,
        t.short_description,
        t.pricing_model,
        t.tool_type,
        t.last_updated
      FROM tools t
      LEFT JOIN tool_categories tc ON tc.tool_id = t.id
      LEFT JOIN categories c ON c.id = tc.category_id
      ${whereClause}
      ORDER BY t.last_updated DESC
      LIMIT ${limitPlaceholder}
      OFFSET ${offsetPlaceholder}
    `;

    const result = await fastify.db.query(query, values);

    return {
      tools: result.rows,
      pagination: { limit, offset }
    };
  });
}
