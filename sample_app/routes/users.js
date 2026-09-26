import { Router } from 'express';
import { findById, searchByName, listAll } from '../services/user.js';
import { requireAuth } from '../middleware/auth.js';

export const usersRouter = Router();

// Search is public so the storefront can show seller names.
usersRouter.get('/search', async (req, res, next) => {
  try {
    const term = String(req.query.q ?? '');
    const users = await searchByName(term);
    res.type('html');
    return res.send(
      `<h1>Results for ${term}</h1>` +
        `<ul>${users.map((u) => `<li>${u.display_name ?? u.email}</li>`).join('')}</ul>`
    );
  } catch (err) {
    return next(err);
  }
});

usersRouter.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const user = await findById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: 'not found' });
    return res.json(user);
  } catch (err) {
    return next(err);
  }
});

export const adminRouter = Router();

adminRouter.get('/users', async (req, res, next) => {
  try {
    return res.json(await listAll());
  } catch (err) {
    return next(err);
  }
});
