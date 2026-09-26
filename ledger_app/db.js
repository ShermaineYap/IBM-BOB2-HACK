import pg from 'pg';
import { config } from './config.js';

export const pool = new pg.Pool({ connectionString: config.databaseUrl });

export async function query(text, params = []) {
  const { rows } = await pool.query(text, params);
  return rows;
}

// Sortable columns are chosen from a fixed map, never from raw input.
const SORT_COLUMNS = { date: 'issued_at', amount: 'amount_cents', customer: 'customer_name' };

export function orderBy(key) {
  return SORT_COLUMNS[key] ?? 'issued_at';
}
