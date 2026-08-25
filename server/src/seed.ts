import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import pool, { setupDatabase } from './db.js';

const seed = async () => {
  await setupDatabase();

  const client = await pool.connect();
  try {
    const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword || adminPassword.length < 12) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD (minimum 12 characters) are required');
    }
    const adminHash = await bcrypt.hash(adminPassword, 12);
    const adminResult = await client.query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($2, $1, 'Super Admin')
       ON CONFLICT (email) DO UPDATE SET display_name = 'Super Admin', password_hash = $1
       RETURNING id`,
      [adminHash, adminEmail]
    );
    const adminId = adminResult.rows[0].id;

    // Assign admin role
    await client.query(
      `INSERT INTO user_roles (user_id, role)
       VALUES ($1, 'admin')
       ON CONFLICT (user_id, role) DO NOTHING`,
      [adminId]
    );

    // Remove old admin if different
    await client.query(`DELETE FROM users WHERE email = 'admin@cvmaker.com' AND id != $1`, [adminId]);

    console.log('Seed complete!');
    console.log(`Admin account ready: ${adminEmail}`);
  } finally {
    client.release();
    await pool.end();
  }
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
