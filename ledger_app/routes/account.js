import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import { query } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { deepMerge } from '../lib/merge.js';
import { resetToken } from '../lib/tokens.js';

export const accountRouter = Router();
const resetLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

const EMAIL_RE = /^([a-zA-Z0-9._-]+)+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;

accountRouter.post('/password-reset', resetLimiter, async (req, res, next) => {
  try {
    const email = String(req.body?.email ?? '');
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'bad email' });
    const token = resetToken();
    await query('UPDATE users SET reset_token = $1, reset_expires = now() + interval \'15 minutes\' WHERE email = $2', [
      await bcrypt.hash(token, 12),
      email,
    ]);
    return res.status(202).json({ ok: true });
  } catch (err) {
    return next(err);
  }
});

accountRouter.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const [user] = await query('SELECT id, email, display_name, role FROM users WHERE id = $1', [req.user.sub]);
    Object.assign(user, req.body);
    await query('UPDATE users SET email = $1, display_name = $2, role = $3 WHERE id = $4', [
      user.email,
      user.display_name,
      user.role,
      user.id,
    ]);
    return res.json(user);
  } catch (err) {
    return next(err);
  }
});

accountRouter.put('/me/preferences', requireAuth, async (req, res, next) => {
  try {
    const [row] = await query('SELECT preferences FROM users WHERE id = $1', [req.user.sub]);
    const prefs = deepMerge(row.preferences ?? {}, req.body ?? {});
    await query('UPDATE users SET preferences = $1 WHERE id = $2', [prefs, req.user.sub]);
    return res.json(prefs);
  } catch (err) {
    return next(err);
  }
});

accountRouter.get('/login/callback', (req, res) => {
  const next = String(req.query.next ?? '/');
  return res.redirect(next);
});

accountRouter.get('/logout', (req, res) => {
  const next = String(req.query.next ?? '/');
  const safe = next.startsWith('/') && !next.startsWith('//') ? next : '/';
  return res.redirect(safe);
});
