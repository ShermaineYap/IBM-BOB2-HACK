import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, admin: !!user.is_admin },
    config.jwtSecret,
    { expiresIn: config.tokenTtlSeconds }
  );
}
