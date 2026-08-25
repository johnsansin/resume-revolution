import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { pool } from './db';

export interface Session {
  userId: string;
  email: string;
  tokenVersion: number;
  purpose: 'access';
}

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');
  return value;
}

function expiry() {
  const raw = process.env.JWT_EXPIRES_IN || '7d';
  const match = /^(\d+)([smhd])$/.exec(raw);
  if (!match) return 604800;
  return Number(match[1]) * ({ s: 1, m: 60, h: 3600, d: 86400 }[match[2] as 's' | 'm' | 'h' | 'd']);
}

export function signSession(session: Session) {
  return jwt.sign(session, secret(), {
    expiresIn: expiry(), issuer: 'cv-maker', audience: 'cv-maker-web',
  });
}

export async function requireSession(request: NextRequest): Promise<Session> {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) throw new HttpError(401, 'No token provided');
  let session: Session;
  try {
    session = jwt.verify(header.slice(7), secret(), {
      issuer: 'cv-maker', audience: 'cv-maker-web',
    }) as Session;
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }
  if (session.purpose !== 'access') throw new HttpError(401, 'Invalid token purpose');
  const result = await pool.query(
    'SELECT email, is_active, token_version FROM users WHERE id = $1',
    [session.userId],
  );
  const user = result.rows[0];
  if (!user || !user.is_active || user.email !== session.email || user.token_version !== session.tokenVersion) {
    throw new HttpError(401, 'Session is no longer valid');
  }
  return session;
}

export async function requireAdmin(request: NextRequest) {
  const session = await requireSession(request);
  const role = await pool.query(
    "SELECT 1 FROM user_roles WHERE user_id = $1 AND role = 'admin'",
    [session.userId],
  );
  if (!role.rowCount) throw new HttpError(403, 'Admin access required');
  return session;
}

export const hashResetToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex');

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
