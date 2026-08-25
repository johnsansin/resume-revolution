import pg from 'pg';

declare global {
  var __resumePool: pg.Pool | undefined;
}

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

export const pool = globalThis.__resumePool ?? new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

if (process.env.NODE_ENV !== 'production') globalThis.__resumePool = pool;
