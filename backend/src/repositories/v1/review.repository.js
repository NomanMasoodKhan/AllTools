export async function findToolById(db, toolId) {
  const result = await db.query(
    `SELECT id, approval_status, publication_status
     FROM tools
     WHERE id = $1`,
    [toolId]
  );

  return result.rows[0] ?? null;
}

export async function createReview(db, payload) {
  const result = await db.query(
    `INSERT INTO reviews (tool_id, user_id, rating, title, content)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, tool_id, user_id, rating, title, content, created_at, updated_at`,
    [payload.toolId, payload.userId, payload.rating, payload.title ?? null, payload.content]
  );

  return result.rows[0];
}

export async function listReviewsForPublicTool(db, toolId) {
  const result = await db.query(
    `SELECT
       r.id,
       r.tool_id,
       r.user_id,
       r.rating,
       r.title,
       r.content,
       r.created_at,
       r.updated_at,
       u.email AS reviewer_email
     FROM reviews r
     INNER JOIN tools t ON t.id = r.tool_id
     INNER JOIN users u ON u.id = r.user_id
     WHERE r.tool_id = $1
       AND t.approval_status = 'approved'
       AND t.publication_status = 'published'
     ORDER BY r.created_at DESC`,
    [toolId]
  );

  return result.rows;
}
