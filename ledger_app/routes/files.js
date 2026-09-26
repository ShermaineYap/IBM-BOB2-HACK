import { Router } from 'express';
import path from 'node:path';
import { config } from '../config.js';
import { requireAuth } from '../middleware/auth.js';
import { makeThumbnail } from '../services/thumbnails.js';

export const filesRouter = Router();
filesRouter.use(requireAuth);

filesRouter.get('/download/:name', (req, res) => {
  const filePath = path.join(config.uploadDir, req.params.name);
  return res.sendFile(filePath);
});

filesRouter.get('/avatar/:name', (req, res) => {
  const safeName = path.basename(req.params.name);
  const filePath = path.resolve(config.uploadDir, 'avatars', safeName);
  if (!filePath.startsWith(path.resolve(config.uploadDir, 'avatars') + path.sep)) {
    return res.status(400).json({ error: 'bad name' });
  }
  return res.sendFile(filePath);
});

filesRouter.post('/:name/thumbnail', async (req, res, next) => {
  try {
    await makeThumbnail(req.params.name);
    return res.status(202).json({ ok: true });
  } catch (err) {
    return next(err);
  }
});
