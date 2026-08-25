import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import pool from '../db.js';
import { generateToken, authMiddleware } from '../middleware/auth.js';

const router = Router();
const normalizeEmail = (value: unknown): string => typeof value === 'string' ? value.trim().toLowerCase() : '';
const isValidPassword = (value: unknown): value is string =>
  typeof value === 'string' && value.length >= 6 && value.length <= 128;

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { password, displayName } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    if (!isValidPassword(password)) {
      res.status(400).json({ error: 'Password must be between 6 and 128 characters' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const name = typeof displayName === 'string' && displayName.trim()
      ? displayName.trim().slice(0, 100) : email.split('@')[0];

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, display_name)
       VALUES ($1, $2, $3)
       RETURNING id, email, display_name, avatar_url, is_active, created_at`,
      [email, passwordHash, name]
    );

    const user = result.rows[0];

    // Default role
    await pool.query(
      `INSERT INTO user_roles (user_id, role) VALUES ($1, 'user')`,
      [user.id]
    );
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       SELECT DISTINCT user_id, 'registration', 'New user registered', $1, $2
       FROM user_roles WHERE role = 'admin'`,
      [`${name} (${email}) created a new account.`, `/admin/users?search=${encodeURIComponent(email)}`]
    );

    const rolesResult = await pool.query(
      'SELECT role FROM user_roles WHERE user_id = $1',
      [user.id]
    );

    const token = generateToken({ userId: user.id, email: user.email, tokenVersion: 0, purpose: 'access' });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        isActive: user.is_active,
        createdAt: user.created_at,
        roles: rolesResult.rows.map((r) => r.role),
      },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const result = await pool.query(
      'SELECT id, email, password_hash, display_name, avatar_url, is_active, token_version FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const user = result.rows[0];

    if (!user.is_active) {
      res.status(403).json({ error: 'This account has been deactivated. Contact the administrator.' });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      userId: user.id, email: user.email, tokenVersion: user.token_version, purpose: 'access',
    });

    // Log login (fire and forget)
    const ip = req.ip || req.socket.remoteAddress || '';
    const userAgent = (req.headers['user-agent'] || '').slice(0, 300);
    pool.query(
      `INSERT INTO login_history (user_id, email, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)`,
      [user.id, user.email, ip, userAgent]
    ).catch(() => {});

    const rolesResult = await pool.query(
      'SELECT role FROM user_roles WHERE user_id = $1',
      [user.id]
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        isActive: user.is_active,
        roles: rolesResult.rows.map((r) => r.role),
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT id, email, display_name, avatar_url, is_active, created_at FROM users WHERE id = $1',
      [req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    const rolesResult = await pool.query(
      'SELECT role FROM user_roles WHERE user_id = $1',
      [user.id]
    );

    res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      isActive: user.is_active,
      createdAt: user.created_at,
      roles: rolesResult.rows.map((r) => r.role),
    });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/profile', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { displayName, avatarUrl } = req.body;
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (displayName !== undefined) {
      updates.push(`display_name = $${idx++}`);
      values.push(displayName);
    }
    if (avatarUrl !== undefined) {
      updates.push(`avatar_url = $${idx++}`);
      values.push(avatarUrl);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No updates provided' });
      return;
    }

    updates.push(`updated_at = now()`);
    values.push(req.user!.userId);

    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}
       RETURNING id, email, display_name, avatar_url, is_active, created_at`,
      values
    );

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      avatarUrl: user.avatar_url,
      isActive: user.is_active,
      createdAt: user.created_at,
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/change-password', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Current and new passwords are required' });
      return;
    }

    if (!isValidPassword(newPassword)) {
      res.status(400).json({ error: 'New password must be between 6 and 128 characters' });
      return;
    }

    const result = await pool.query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, token_version = token_version + 1, updated_at = now() WHERE id = $2',
      [newHash, req.user!.userId]
    );

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    // Always return success to prevent email enumeration
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const resetToken = crypto.randomBytes(32).toString('base64url');
      const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
      await pool.query('DELETE FROM password_reset_tokens WHERE user_id = $1 OR expires_at < now()', [result.rows[0].id]);
      await pool.query(
        `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
         VALUES ($1, $2, now() + interval '15 minutes')`,
        [result.rows[0].id, tokenHash]
      );
      if (process.env.NODE_ENV !== 'production' && process.env.EXPOSE_DEV_RESET_TOKEN === 'true') {
        res.json({ message: 'Development reset token generated.', resetToken });
        return;
      }
    }

    res.json({ message: 'If an account exists with that email, you will receive a password reset link.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    if (!isValidPassword(newPassword)) {
      res.status(400).json({ error: 'Password must be between 6 and 128 characters' });
      return;
    }

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const resetResult = await client.query(
        `SELECT id, user_id FROM password_reset_tokens
         WHERE token_hash = $1 AND used_at IS NULL AND expires_at > now() FOR UPDATE`,
        [tokenHash]
      );
      if (resetResult.rows.length === 0) throw new Error('Invalid reset token');
      const reset = resetResult.rows[0];
      const newHash = await bcrypt.hash(newPassword, 12);
      await client.query(
        'UPDATE users SET password_hash = $1, token_version = token_version + 1, updated_at = now() WHERE id = $2',
        [newHash, reset.user_id]
      );
      await client.query('UPDATE password_reset_tokens SET used_at = now() WHERE id = $1', [reset.id]);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

    res.json({ message: 'Password reset successfully' });
  } catch {
    res.status(401).json({ error: 'Invalid or expired reset token' });
  }
});

export default router;
