import { Router } from 'express';
import { auth, permitir } from '../../shared/auth.js';
import { dgiiStatus, lookupRnc, syncCatalog } from './service.js';

const dgiiRouter = Router();
dgiiRouter.use(auth);

dgiiRouter.get('/rnc/:rnc', permitir('vendedor', 'cajero', 'administrador', 'revendedor'), async (req, res) => {
  const result = await lookupRnc(String(req.params.rnc ?? ''));
  res.json(result);
});

dgiiRouter.get('/status', permitir('administrador'), (_req, res) => {
  res.json({ ok: true, ...dgiiStatus() });
});

dgiiRouter.post('/sync-now', permitir('administrador'), async (_req, res) => {
  const result = await syncCatalog('manual');
  res.json({ ok: result.ok, message: result.message ?? null, ...dgiiStatus() });
});

export { dgiiRouter };
