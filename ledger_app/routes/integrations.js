import { Router } from 'express';
import { config } from '../config.js';
import { requireAuth, requireAdmin, requireInternalKey } from '../middleware/auth.js';
import { validSignature } from '../lib/tokens.js';
import { query } from '../db.js';
import { uploadDirUsage } from '../services/thumbnails.js';

export const integrationsRouter = Router();

integrationsRouter.post('/webhooks/test', requireAuth, async (req, res, next) => {
  try {
    const target = String(req.body?.url ?? '');
    const response = await fetch(target, { method: 'POST', body: JSON.stringify({ ping: true }) });
    return res.json({ status: response.status });
  } catch (err) {
    return next(err);
  }
});

integrationsRouter.post('/webhooks/payment', async (req, res) => {
  const raw = JSON.stringify(req.body ?? {});
  if (!validSignature(raw, req.headers['x-signature'], config.webhookSecret)) {
    return res.status(401).json({ error: 'bad signature' });
  }
  await query('UPDATE invoices SET paid_at = now() WHERE id = $1', [req.body.invoiceId]);
  return res.json({ ok: true });
});

integrationsRouter.get('/admin/report', requireAdmin, async (_req, res) => {
  const rows = await query('SELECT owner_id, count(*) AS invoices, sum(amount_cents) AS total FROM invoices GROUP BY owner_id');
  return res.json({ rows, disk: await uploadDirUsage() });
});

integrationsRouter.get('/internal/health', requireInternalKey, (_req, res) => res.json({ ok: true }));
