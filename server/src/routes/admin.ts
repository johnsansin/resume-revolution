import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Not authenticated' });
    return;
  }

  const result = await pool.query(
    'SELECT role FROM user_roles WHERE user_id = $1 AND role = $2',
    [req.user.userId, 'admin']
  );

  if (result.rows.length === 0) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
};

// All admin routes require auth + admin role
router.use(authMiddleware, requireAdmin);

// --- Dashboard Stats ---
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const [usersResult, onlineUsersResult, cvsResult, rolesResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query("SELECT COUNT(*) as count FROM users WHERE last_seen_at >= now() - interval '2 minutes'"),
      pool.query('SELECT COUNT(*) as count FROM saved_cvs'),
      pool.query(`SELECT role, COUNT(*) as count FROM user_roles GROUP BY role`),
    ]);

    const totalUsers = parseInt(usersResult.rows[0].count, 10);
    const onlineUsers = parseInt(onlineUsersResult.rows[0].count, 10);
    const totalCVs = parseInt(cvsResult.rows[0].count, 10);
    const roles: Record<string, number> = {};
    rolesResult.rows.forEach((r) => { roles[r.role] = parseInt(r.count, 10); });

    const recentLogins = await pool.query(
      `SELECT lh.*, u.display_name
       FROM login_history lh
       JOIN users u ON u.id = lh.user_id
       ORDER BY lh.logged_in_at DESC
       LIMIT 5`
    );

    res.json({
      totalUsers,
      onlineUsers,
      totalCVs,
      roles,
      recentLogins: recentLogins.rows.map(formatLoginHistory),
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- User Management ---
router.get('/users', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: unknown[] = [];

    if (search) {
      whereClause = `WHERE u.email ILIKE $1 OR u.display_name ILIKE $1`;
      params.push(`%${search}%`);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM users u ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const queryIdx = params.length + 1;
    const result = await pool.query(
      `SELECT u.id, u.email, u.display_name, u.avatar_url, u.phone, u.is_active, u.created_at,
              array_agg(ur.role) as roles,
              (SELECT COUNT(*) FROM saved_cvs WHERE user_id = u.id) as cv_count,
              (SELECT MAX(logged_in_at) FROM login_history WHERE user_id = u.id) as last_login
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       ${whereClause}
       GROUP BY u.id
       ORDER BY u.created_at DESC
       LIMIT $${queryIdx} OFFSET $${queryIdx + 1}`,
      [...params, limit, offset]
    );

    res.json({
      users: result.rows.map((row) => ({
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        avatarUrl: row.avatar_url,
        phone: row.phone,
        isActive: row.is_active,
        createdAt: row.created_at,
        roles: row.roles || [],
        cvCount: parseInt(row.cv_count, 10),
        lastLogin: row.last_login,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Admin list users error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/toggle-active', async (req: Request, res: Response) => {
  try {
    if (req.params.id === req.user!.userId) {
      res.status(400).json({ error: 'Cannot deactivate your own account' });
      return;
    }
    const result = await pool.query(
      `UPDATE users SET is_active = NOT is_active, token_version = token_version + 1, updated_at = now()
       WHERE id = $1
       RETURNING id, email, display_name, is_active`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = result.rows[0];
    res.json({
      id: user.id,
      email: user.email,
      displayName: user.display_name,
      isActive: user.is_active,
    });
  } catch (err) {
    console.error('Toggle user active error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/users/:id', async (req: Request, res: Response) => {
  try {
    if (req.params.id === req.user!.userId) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/users/:id/reset-password', async (req: Request, res: Response) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6 || newPassword.length > 128) {
      res.status(400).json({ error: 'New password must be between 6 and 128 characters' });
      return;
    }

    const result = await pool.query(
      'SELECT id, email FROM users WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      'UPDATE users SET password_hash = $1, token_version = token_version + 1, updated_at = now() WHERE id = $2',
      [newHash, req.params.id]
    );

    res.json({ message: `Password reset for ${result.rows[0].email}` });
  } catch (err) {
    console.error('Admin reset password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Role Management ---
router.get('/roles', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT ur.id, ur.user_id, ur.role, ur.created_at,
              u.email, u.display_name
       FROM user_roles ur
       JOIN users u ON u.id = ur.user_id
       ORDER BY ur.created_at DESC`
    );

    res.json(result.rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      role: row.role,
      createdAt: row.created_at,
      email: row.email,
      displayName: row.display_name,
    })));
  } catch (err) {
    console.error('Get roles error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/roles', async (req: Request, res: Response) => {
  try {
    const { userId, role } = req.body;

    if (!userId || !role) {
      res.status(400).json({ error: 'userId and role are required' });
      return;
    }

    if (!['admin', 'moderator', 'user'].includes(role)) {
      res.status(400).json({ error: 'Invalid role' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO user_roles (user_id, role)
       VALUES ($1, $2)
       ON CONFLICT (user_id, role) DO NOTHING
       RETURNING id, user_id, role, created_at`,
      [userId, role]
    );

    res.status(201).json(result.rows[0] || { message: 'Role already exists' });
  } catch (err) {
    console.error('Create role error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/roles/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM user_roles WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Role not found' });
      return;
    }

    res.json({ message: 'Role removed' });
  } catch (err) {
    console.error('Delete role error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Content Moderation (CVs) ---
router.get('/cvs', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || '';
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE cv.deleted_at IS NULL';
    const params: unknown[] = [];

    if (search) {
      whereClause = `WHERE cv.deleted_at IS NULL AND (cv.name ILIKE $1 OR u.email ILIKE $1 OR u.display_name ILIKE $1)`;
      params.push(`%${search}%`);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM saved_cvs cv
       JOIN users u ON u.id = cv.user_id ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const queryIdx = params.length + 1;
    const result = await pool.query(
      `SELECT cv.id, cv.name, cv.cv_data, cv.template_id, cv.created_at, cv.updated_at,
              u.email as user_email, u.display_name as user_display_name
       FROM saved_cvs cv
       JOIN users u ON u.id = cv.user_id
       ${whereClause}
       ORDER BY cv.updated_at DESC
       LIMIT $${queryIdx} OFFSET $${queryIdx + 1}`,
      [...params, limit, offset]
    );

    res.json({
      cvs: result.rows.map((row) => {
        const personal = (row.cv_data as Record<string, unknown>)?.personal as Record<string, string> || {};
        return {
          id: row.id,
          name: row.name,
          cvData: row.cv_data,
          templateId: row.template_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          userEmail: row.user_email,
          userDisplayName: row.user_display_name,
          fullName: personal.fullName || '',
          phone: personal.phone || '',
          email: personal.email || '',
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Admin list CVs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/cvs/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM saved_cvs WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'CV not found' });
      return;
    }

    res.json({ message: 'CV permanently deleted' });
  } catch (err) {
    console.error('Admin delete CV error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Recycle Bin ---
router.get('/recycle-bin', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || '';
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE cv.deleted_at IS NOT NULL';
    const params: unknown[] = [];

    if (search) {
      whereClause += ` AND (cv.name ILIKE $1 OR u.email ILIKE $1 OR u.display_name ILIKE $1)`;
      params.push(`%${search}%`);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM saved_cvs cv
       JOIN users u ON u.id = cv.user_id
       ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const queryIdx = params.length + 1;
    const result = await pool.query(
      `SELECT cv.id, cv.name, cv.cv_data, cv.template_id, cv.created_at, cv.updated_at,
              cv.deleted_at, cv.deleted_by,
              u.email as user_email, u.display_name as user_display_name,
              d.email as deleted_by_email, d.display_name as deleted_by_name
       FROM saved_cvs cv
       JOIN users u ON u.id = cv.user_id
       LEFT JOIN users d ON d.id = cv.deleted_by
       ${whereClause}
       ORDER BY cv.deleted_at DESC
       LIMIT $${queryIdx} OFFSET $${queryIdx + 1}`,
      [...params, limit, offset]
    );

    res.json({
      cvs: result.rows.map((row) => {
        const personal = (row.cv_data as Record<string, unknown>)?.personal as Record<string, string> || {};
        return {
          id: row.id,
          name: row.name,
          cvData: row.cv_data,
          templateId: row.template_id,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          deletedAt: row.deleted_at,
          deletedBy: row.deleted_by_name || row.deleted_by_email || 'Unknown',
          userEmail: row.user_email,
          userDisplayName: row.user_display_name,
          fullName: personal.fullName || '',
        };
      }),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Recycle bin list error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/recycle-bin/:id/restore', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `UPDATE saved_cvs SET deleted_at = NULL, deleted_by = NULL, updated_at = now()
       WHERE id = $1 AND deleted_at IS NOT NULL
       RETURNING id, name, user_id`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'CV not found in recycle bin' });
      return;
    }

    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, link)
       VALUES ($1, 'cv_restored', 'CV restored', $2, '/dashboard')`,
      [result.rows[0].user_id, `Your CV "${result.rows[0].name}" was restored by a superadmin.`]
    );

    res.json({ message: `CV "${result.rows[0].name}" restored`, id: result.rows[0].id });
  } catch (err) {
    console.error('Restore CV error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/recycle-bin/:id/permanent', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      'DELETE FROM saved_cvs WHERE id = $1 AND deleted_at IS NOT NULL RETURNING id',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'CV not found in recycle bin' });
      return;
    }

    res.json({ message: 'CV permanently deleted' });
  } catch (err) {
    console.error('Permanent delete error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Login History ---
router.get('/login-history', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const search = (req.query.search as string) || '';
    const offset = (page - 1) * limit;

    let whereClause = '';
    const params: unknown[] = [];

    if (search) {
      whereClause = `WHERE lh.email ILIKE $1 OR lh.ip_address ILIKE $1`;
      params.push(`%${search}%`);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) as count FROM login_history lh ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const queryIdx = params.length + 1;
    const result = await pool.query(
      `SELECT lh.*, u.display_name
       FROM login_history lh
       JOIN users u ON u.id = lh.user_id
       ${whereClause}
       ORDER BY lh.logged_in_at DESC
       LIMIT $${queryIdx} OFFSET $${queryIdx + 1}`,
      [...params, limit, offset]
    );

    res.json({
      entries: result.rows.map(formatLoginHistory),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('Admin login history error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function formatLoginHistory(row: Record<string, unknown>) {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    displayName: row.display_name,
    ipAddress: row.ip_address,
    country: row.country,
    countryCode: row.country_code,
    city: row.city,
    userAgent: row.user_agent,
    loggedInAt: row.logged_in_at,
  };
}

export default router;
