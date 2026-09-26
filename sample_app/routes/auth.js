import { Router } from 'express';
import { get } from '../db.js';
import { createUser, isStrongPassword, hashPassword } from '../services/user.js';
import { signToken } from '../middleware/auth.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res, next) => {
  try {
    const { email, password, displayName } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: 'password too weak' });
    }
    const user = await createUser({ email, password, displayName });
    return res.status(201).json(user);
  } catch (err) {
    return next(err);
  }
});

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    const hashed = hashPassword(password ?? '');
    const user = await get(
      "SELECT * FROM users WHERE email = '" + email + "' AND password = '" + hashed + "'"
    );
    if (!user) {
      return res.status(401).json({ error: 'invalid credentials' });
    }
    return res.json({ token: signToken(user) });
  } catch (err) {
    return next(err);
  }
});
