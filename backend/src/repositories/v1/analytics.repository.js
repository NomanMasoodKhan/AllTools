export async function listDeveloperToolAnalytics(db, userId) {
  const result = await db.query(
    `SELECT
       t.id AS tool_id,
       t.name AS tool_name,
       t.approval_status,
       t.publication_status,
       t.view_count AS tool_views,
       COUNT(r.id)::INT AS review_count,
       COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::FLOAT8 AS average_rating
     FROM developer_profiles dp
     INNER JOIN tools t ON t.developer_profile_id = dp.id
     LEFT JOIN reviews r ON r.tool_id = t.id
     WHERE dp.user_id = $1
     GROUP BY t.id
     ORDER BY t.created_at DESC`,
    [userId]
  );

  return result.rows;
}

export async function getDeveloperAnalyticsSummary(db, userId) {
  const result = await db.query(
    `SELECT
       COUNT(t.id)::INT AS tool_count,
       COALESCE(SUM(t.view_count), 0)::INT AS total_views,
       COUNT(r.id)::INT AS total_reviews,
       COALESCE(ROUND(AVG(r.rating)::numeric, 2), 0)::FLOAT8 AS average_rating
     FROM developer_profiles dp
     LEFT JOIN tools t ON t.developer_profile_id = dp.id
     LEFT JOIN reviews r ON r.tool_id = t.id
     WHERE dp.user_id = $1`,
    [userId]
  );

  return result.rows[0] ?? {
    tool_count: 0,
    total_views: 0,
    total_reviews: 0,
    average_rating: 0
  };
}
