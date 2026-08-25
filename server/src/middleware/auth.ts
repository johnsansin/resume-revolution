import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

export interface AuthPayload {
  userId: string;
  email: string;
  tokenVersion: number;
  purpose: 'access';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) throw new Error('JWT_SECRET must be at least 32 characters');
  return secret;
};

const parseExpiry = (): number => {
  const raw = process.env.JWT_EXPIRES_IN || '7d';
  const match = /^(\d+)([smhd])$/.exec(raw);
  if (!match) throw new Error('JWT_EXPIRES_IN must use s, m, h, or d (for example 7d)');
  const factor = { s: 1, m: 60, h: 3600, d: 86400 }[match[2] as 's' | 'm' | 'h' | 'd'];
  return Number(match[1]) * factor;
};

export const generateToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: parseExpiry(), issuer: 'cv-maker', audience: 'cv-maker-web' });
};

export const verifyToken = (token: string): AuthPayload => {
  const payload = jwt.verify(token, getJwtSecret(), { issuer: 'cv-maker', audience: 'cv-maker-web' }) as AuthPayload;
  if (payload.purpose !== 'access') throw new Error('Invalid token purpose');
  return payload;
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    const result = await pool.query('SELECT email, is_active, token_version FROM users WHERE id = $1', [payload.userId]);
    const user = result.rows[0];
    if (!user || !user.is_active || user.email !== payload.email || user.token_version !== payload.tokenVersion) {
      res.status(401).json({ error: 'Session is no longer valid' });
      return;
    }
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const optionalAuth = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const payload = verifyToken(token);
      const result = await pool.query('SELECT is_active, token_version FROM users WHERE id = $1', [payload.userId]);
      if (result.rows[0]?.is_active && result.rows[0].token_version === payload.tokenVersion) req.user = payload;
    } catch {
      // ignore invalid token
    }
  }
  next();
};

export const adminMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }
  // Admin check will be done in the route handler via DB query
  // This middleware just ensures user is authenticated
  next();
};
