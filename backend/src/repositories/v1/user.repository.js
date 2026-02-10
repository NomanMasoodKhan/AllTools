export async function findUserByEmail(db, email) {
  const result = await db.query(
    `SELECT id, email, password_hash, role, is_active
     FROM users
     WHERE email = $1`,
    [email]
  );

  return result.rows[0] ?? null;
}

export async function createUser(db, { email, passwordHash, role }) {
  const result = await db.query(
    `INSERT INTO users (email, password_hash, role)
     VALUES ($1, $2, $3)
     RETURNING id, email, role, created_at`,
    [email, passwordHash, role]
  );

  return result.rows[0];
}
