export async function getDeveloperProfileByUserId(db, userId) {
  const result = await db.query(
    `SELECT id, website_url
     FROM developer_profiles
     WHERE user_id = $1`,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function getCategoriesByIds(db, categoryIds) {
  const result = await db.query(
    `SELECT id
     FROM categories
     WHERE id = ANY($1::uuid[])`,
    [categoryIds]
  );

  return result.rows;
}

export async function createToolWithCategories(db, payload) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const toolResult = await client.query(
      `INSERT INTO tools (
         developer_profile_id,
         name,
         short_description,
         long_description,
         tool_type,
         supported_platforms,
         deployment_type,
         pricing_model,
         developer_profile_link,
         documentation_link,
         version,
         use_cases,
         known_limitations,
         tested_environments,
         demo_links,
         approval_status,
         publication_status
       )
       VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8, $9, $10, $11, $12,
         $13, $14, $15, 'pending', 'draft'
       )
       RETURNING id, name, approval_status, publication_status, created_at`,
      [
        payload.developerProfileId,
        payload.name,
        payload.short_description,
        payload.long_description,
        payload.tool_type,
        payload.supported_platforms,
        payload.deployment_type,
        payload.pricing_model,
        payload.developer_profile_link,
        payload.documentation_url,
        payload.version,
        payload.use_cases,
        payload.known_limitations,
        payload.tested_environments,
        payload.demo_links
      ]
    );

    const tool = toolResult.rows[0];

    for (const categoryId of payload.category_ids) {
      await client.query(
        `INSERT INTO tool_categories (tool_id, category_id)
         VALUES ($1, $2)`,
        [tool.id, categoryId]
      );
    }

    await client.query('COMMIT');

    return tool;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listPendingTools(db) {
  const result = await db.query(
    `SELECT
       t.id,
       t.name,
       t.short_description,
       t.tool_type,
       t.pricing_model,
       t.created_at,
       dp.display_name AS developer_name,
       COALESCE(array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), '{}') AS categories
     FROM tools t
     INNER JOIN developer_profiles dp ON dp.id = t.developer_profile_id
     LEFT JOIN tool_categories tc ON tc.tool_id = t.id
     LEFT JOIN categories c ON c.id = tc.category_id
     WHERE t.approval_status = 'pending'
       AND t.publication_status = 'draft'
     GROUP BY t.id, dp.display_name
     ORDER BY t.created_at ASC`
  );

  return result.rows;
}

export async function getToolForModerationById(db, toolId) {
  const result = await db.query(
    `SELECT id, approval_status, publication_status
     FROM tools
     WHERE id = $1`,
    [toolId]
  );

  return result.rows[0] ?? null;
}

export async function createAdminApproval(db, payload) {
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    const approvalResult = await client.query(
      `INSERT INTO admin_approvals (tool_id, admin_user_id, decision, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING id, tool_id, admin_user_id, decision, notes, decided_at`,
      [payload.toolId, payload.adminUserId, payload.decision, payload.reason ?? null]
    );

    if (payload.decision === 'approved') {
      await client.query(
        `UPDATE tools
         SET publication_status = 'published',
             published_at = NOW(),
             updated_at = NOW()
         WHERE id = $1`,
        [payload.toolId]
      );
    } else {
      await client.query(
        `UPDATE tools
         SET publication_status = 'draft',
             published_at = NULL,
             updated_at = NOW()
         WHERE id = $1`,
        [payload.toolId]
      );
    }

    await client.query('COMMIT');

    return approvalResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function listPublicTools(db, filters) {
  const values = [filters.limit, filters.offset];
  const whereClauses = [
    "t.approval_status = 'approved'",
    "t.publication_status = 'published'"
  ];

  if (filters.search) {
    values.push(filters.search);
    whereClauses.push(
      `to_tsvector('simple', COALESCE(t.name, '') || ' ' || COALESCE(t.short_description, '') || ' ' || COALESCE(t.long_description, ''))
       @@ plainto_tsquery('simple', $${values.length})`
    );
  }

  if (filters.category_id) {
    values.push(filters.category_id);
    whereClauses.push(
      `EXISTS (
         SELECT 1
         FROM tool_categories tc_filter
         WHERE tc_filter.tool_id = t.id
           AND tc_filter.category_id = $${values.length}
       )`
    );
  }

  if (filters.tool_type) {
    values.push(filters.tool_type);
    whereClauses.push(`t.tool_type = $${values.length}`);
  }

  if (filters.pricing_model) {
    values.push(filters.pricing_model);
    whereClauses.push(`t.pricing_model = $${values.length}`);
  }

  const whereSql = whereClauses.join(' AND ');

  const query = `
    SELECT
      t.id,
      t.name,
      t.short_description,
      t.tool_type,
      t.pricing_model,
      t.version,
      t.published_at,
      dp.display_name AS developer_name,
      COALESCE(array_agg(DISTINCT c.name) FILTER (WHERE c.name IS NOT NULL), '{}') AS categories,
      COUNT(*) OVER ()::INT AS total_count
    FROM tools t
    INNER JOIN developer_profiles dp ON dp.id = t.developer_profile_id
    LEFT JOIN tool_categories tc ON tc.tool_id = t.id
    LEFT JOIN categories c ON c.id = tc.category_id
    WHERE ${whereSql}
    GROUP BY t.id, dp.display_name
    ORDER BY t.published_at DESC, t.created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await db.query(query, values);
  const total = result.rows[0]?.total_count ?? 0;

  return {
    tools: result.rows.map(({ total_count, ...tool }) => tool),
    total
  };
}
