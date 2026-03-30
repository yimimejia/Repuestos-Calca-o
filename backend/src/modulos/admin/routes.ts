import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { auth, permitir } from '../../shared/auth.js';

const adminRouter = Router();
adminRouter.use(auth, permitir('administrador'));

adminRouter.post('/importar-backup', (req, res) => {
  const { nombre_archivo, contenido_base64 } = req.body as { nombre_archivo?: string; contenido_base64?: string };
  if (!nombre_archivo || !contenido_base64) return res.status(400).json({ error: 'Archivo inválido' });
  if (!nombre_archivo.toLowerCase().endsWith('.bak')) return res.status(400).json({ error: 'Solo se permiten archivos .bak' });

  const buffer = Buffer.from(contenido_base64, 'base64');
  if (!buffer.byteLength) return res.status(400).json({ error: 'El archivo está vacío' });
  if (buffer.byteLength > 50 * 1024 * 1024) return res.status(413).json({ error: 'El archivo excede 50MB' });

  const dir = path.resolve(process.cwd(), 'backups');
  fs.mkdirSync(dir, { recursive: true });
  const limpio = nombre_archivo.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const destino = path.join(dir, `${Date.now()}-${limpio}`);
  fs.writeFileSync(destino, buffer);

  res.json({ ok: true, archivo_guardado: path.basename(destino), bytes: buffer.byteLength });
});

export { adminRouter };
