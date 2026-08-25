import { Router, Request, Response } from 'express';
import pool from '../db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, cv_data, template_id, created_at, updated_at
       FROM saved_cvs
       WHERE user_id = $1 AND deleted_at IS NULL
       ORDER BY updated_at DESC`,
      [req.user!.userId]
    );

    res.json(result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      cvData: row.cv_data,
      templateId: row.template_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })));
  } catch (err) {
    console.error('Fetch CVs error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, name, cv_data, template_id, created_at, updated_at
       FROM saved_cvs
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`,
      [req.params.id, req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'CV not found' });
      return;
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      cvData: row.cv_data,
      templateId: row.template_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error('Fetch CV error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, cvData, templateId } = req.body;

    if (!cvData) {
      res.status(400).json({ error: 'CV data is required' });
      return;
    }

    const result = await pool.query(
      `INSERT INTO saved_cvs (user_id, name, cv_data, template_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, cv_data, template_id, created_at, updated_at`,
      [req.user!.userId, name || 'Untitled CV', cvData, templateId || 'classic']
    );

    const row = result.rows[0];
    res.status(201).json({
      id: row.id,
      name: row.name,
      cvData: row.cv_data,
      templateId: row.template_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error('Save CV error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, cvData, templateId } = req.body;
    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (name !== undefined) {
      updates.push(`name = $${idx++}`);
      values.push(name);
    }
    if (cvData !== undefined) {
      updates.push(`cv_data = $${idx++}`);
      values.push(cvData);
    }
    if (templateId !== undefined) {
      updates.push(`template_id = $${idx++}`);
      values.push(templateId);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No updates provided' });
      return;
    }

    updates.push('updated_at = now()');
    values.push(req.params.id, req.user!.userId);

    const result = await pool.query(
      `UPDATE saved_cvs SET ${updates.join(', ')}
       WHERE id = $${idx++} AND user_id = $${idx} AND deleted_at IS NULL
       RETURNING id, name, cv_data, template_id, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'CV not found' });
      return;
    }

    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      cvData: row.cv_data,
      templateId: row.template_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  } catch (err) {
    console.error('Update CV error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `UPDATE saved_cvs SET deleted_at = now(), deleted_by = $3
       WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [req.params.id, req.user!.userId, req.user!.userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'CV not found' });
      return;
    }

    res.json({ message: 'CV moved to recycle bin' });
  } catch (err) {
    console.error('Delete CV error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
