import express from 'express';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { usersRouter, adminRouter } from './routes/users.js';

const app = express();
app.use(express.json({ limit: '100kb' }));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use('/users', usersRouter);
app.use('/admin', adminRouter);

app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err.message, stack: err.stack });
});

app.listen(config.port, () => {
  console.log(`Shoply API listening on :${config.port}`);
});
