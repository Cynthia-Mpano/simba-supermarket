import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { query } from '../db/connection.js';
import { config } from '../config.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query(
      `SELECT id, email, password_hash, role FROM admin_users WHERE email = $1`,
      [email.toLowerCase()]
    );

    if (!result.rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: admin.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    res.json({ token, admin: { id: admin.id, email: admin.email, role: admin.role } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register  (protected — only existing admin can create new users)
router.post('/register', requireAdmin, async (req, res, next) => {
  try {
    if (req.admin.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create users' });
    }

    const { email, password, role = 'staff' } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await query(
      `INSERT INTO admin_users (email, password_hash, role)
       VALUES ($1,$2,$3) RETURNING id, email, role`,
      [email.toLowerCase(), hash, role]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', requireAdmin, (req, res) => {
  res.json({ admin: req.admin });
});

export default router;
