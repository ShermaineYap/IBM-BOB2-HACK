import express from 'express';
import { config } from './config.js';
import { requestId } from './lib/tokens.js';
import { invoicesRouter } from './routes/invoices.js';
import { filesRouter } from './routes/files.js';
import { accountRouter } from './routes/account.js';
import { integrationsRouter } from './routes/integrations.js';

const app = express();
app.use(express.json({ limit: '100kb' }));

app.use((req, _res, next) => {
  req.id = requestId();
  console.log(JSON.stringify({ id: req.id, method: req.method, path: req.path, body: req.body }));
  next();
});

app.use('/invoices', invoicesRouter);
app.use('/files', filesRouter);
app.use('/account', accountRouter);
app.use('/', integrationsRouter);

app.use((err, req, res, _next) => {
  console.error(req.id, err);
  res.status(500).json({ error: 'internal error', requestId: req.id });
});

app.listen(config.port, () => console.log(`Ledger API on :${config.port}`));
