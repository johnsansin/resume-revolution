import { NextRequest } from 'next/server';
import { HttpError } from './auth';

const attempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'local';
  const key = `${ip}:${request.nextUrl.pathname}`;
  const now = Date.now();
  const old = attempts.get(key);
  const current = !old || old.resetAt <= now ? { count: 0, resetAt: now + 15 * 60_000 } : old;
  current.count += 1;
  attempts.set(key, current);
  if (current.count > 20) throw new HttpError(429, 'Too many attempts. Try again later.');
}
