import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import pool, { setupDatabase } from './db.js';

const USER_COUNT = 50;
const DEFAULT_PASSWORD = 'CareerCanvas-Test-2026!';

async function seedTestUsers() {
  await setupDatabase();
  const password = process.env.TEST_USER_PASSWORD || DEFAULT_PASSWORD;
  if (password.length < 12) throw new Error('TEST_USER_PASSWORD must be at least 12 characters');

  const passwordHash = await bcrypt.hash(password, 12);
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let index = 1; index <= USER_COUNT; index += 1) {
      const suffix = String(index).padStart(3, '0');
      const email = `test.user.${suffix}@example.invalid`;
      const result = await client.query(
        `INSERT INTO users (email, password_hash, display_name, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (email) DO UPDATE
         SET display_name = EXCLUDED.display_name,
             password_hash = EXCLUDED.password_hash,
             is_active = true,
             updated_at = now()
         RETURNING id`,
        [email, passwordHash, `Test User ${suffix}`],
      );
      await client.query(
        `INSERT INTO user_roles (user_id, role)
         VALUES ($1, 'user')
         ON CONFLICT (user_id, role) DO NOTHING`,
        [result.rows[0].id],
      );
    }
    await client.query('COMMIT');
    console.log(`Registered ${USER_COUNT} test users: test.user.001@example.invalid through test.user.050@example.invalid`);
    console.log(`Shared test password: ${password}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedTestUsers().catch((error) => {
  console.error('Test-user seed failed:', error);
  process.exit(1);
});
