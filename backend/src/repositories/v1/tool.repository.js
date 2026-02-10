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
      [payload.toolId, payload.adminUserId, payload.decision, payload.notes ?? null]
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
