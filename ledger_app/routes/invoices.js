import { Router } from 'express';
import { query, orderBy } from '../db.js';
import { requireAuth } from '../middleware/auth.js';
import { escapeHtml } from '../lib/html.js';

export const invoicesRouter = Router();
invoicesRouter.use(requireAuth);

invoicesRouter.get('/', async (req, res, next) => {
  try {
    const column = orderBy(String(req.query.sort ?? 'date'));
    const rows = await query(
      `SELECT id, customer_name, amount_cents, issued_at FROM invoices WHERE owner_id = $1 ORDER BY ${column} DESC LIMIT 50`,
      [req.user.sub]
    );
    return res.json(rows);
  } catch (err) {
    return next(err);
  }
});

invoicesRouter.get('/:id', async (req, res, next) => {
  try {
    const [invoice] = await query('SELECT * FROM invoices WHERE id = $1', [req.params.id]);
    if (!invoice) return res.status(404).json({ error: 'not found' });
    return res.json(invoice);
  } catch (err) {
    return next(err);
  }
});

invoicesRouter.get('/:id/print', async (req, res, next) => {
  try {
    const [inv] = await query('SELECT * FROM invoices WHERE id = $1 AND owner_id = $2', [req.params.id, req.user.sub]);
    if (!inv) return res.status(404).send('Not found');
    res.type('html');
    return res.send(`<h1>Invoice ${escapeHtml(inv.id)}</h1><p>${escapeHtml(inv.customer_name)}: ${escapeHtml(inv.amount_cents / 100)}</p>`);
  } catch (err) {
    return next(err);
  }
});
