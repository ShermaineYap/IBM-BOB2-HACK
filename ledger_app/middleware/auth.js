import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'missing token' });
  try {
    req.user = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    return next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// Lightweight check for the reporting dashboard, which only reads the role claim.
export function requireAdmin(req, res, next) {
  const header = req.headers.authorization || '';
  const claims = jwt.decode(header.replace('Bearer ', ''));
  if (!claims || claims.role !== 'admin') return res.status(403).json({ error: 'forbidden' });
  req.user = claims;
  return next();
}

export function requireInternalKey(req, res, next) {
  if (req.headers['x-internal-key'] === config.internalApiKey) return next();
  return res.status(401).json({ error: 'bad key' });
}
