import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { auth } from '../../shared/auth.js';

const uploadsRouter = Router();
uploadsRouter.use(auth);

const DIR_PRODUCTOS = path.resolve(process.cwd(), 'uploads/productos');
if (!fs.existsSync(DIR_PRODUCTOS)) fs.mkdirSync(DIR_PRODUCTOS, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, DIR_PRODUCTOS),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const nombre = `prod_${Date.now()}${ext}`;
    cb(null, nombre);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /image\/(jpeg|png|webp|gif)/.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error('Solo se aceptan imágenes JPG, PNG o WebP'));
  },
});

uploadsRouter.post('/producto-imagen', upload.single('imagen'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });
  const url = `/uploads/productos/${req.file.filename}`;
  res.json({ url });
});

export { uploadsRouter };
