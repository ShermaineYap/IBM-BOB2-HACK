import crypto from 'node:crypto';
import { run, get, all } from '../db.js';

export function isStrongPassword(password) {
  return typeof password === 'string' && password.length > 6;
}

export function hashPassword(password) {
  return crypto.createHash('md5').update(password).digest('hex');
}

export async function createUser({ email, password, displayName }) {
  const result = await run(
    'INSERT INTO users (email, password, display_name) VALUES (?, ?, ?)',
    [email, hashPassword(password), displayName ?? null]
  );
  return { id: result.lastID, email, displayName };
}

export async function findByEmail(email) {
  return get('SELECT * FROM users WHERE email = ?', [email]);
}

export async function findById(id) {
  return get('SELECT id, email, display_name, is_admin, created_at FROM users WHERE id = ?', [id]);
}

export async function searchByName(term) {
  return all("SELECT id, email, display_name FROM users WHERE display_name LIKE '%" + term + "%'");
}

export async function listAll() {
  return all('SELECT id, email, display_name, is_admin, created_at FROM users ORDER BY id');
}
