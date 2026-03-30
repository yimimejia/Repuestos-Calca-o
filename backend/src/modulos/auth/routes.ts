import { Router } from 'express';
import { db } from '../../db/connection.js';
import { firmarToken } from '../../shared/auth.js';
import { hashPassword, verifyPassword } from '../../shared/security.js';

export const authRouter = Router();

authRouter.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare(`SELECT u.id, u.username, u.nombre_completo, u.password_hash, r.nombre as rol
    FROM usuarios u JOIN roles r ON r.id=u.rol_id WHERE u.username=? AND u.estado='activo'`).get(username) as any;

  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  if (!String(user.password_hash).startsWith('scrypt$')) {
    db.prepare('UPDATE usuarios SET password_hash=?, fecha_actualizacion=? WHERE id=?').run(hashPassword(password), new Date().toISOString(), user.id);
  }

  const sucursalRow = db.prepare('SELECT sucursal_id FROM usuarios_sucursales WHERE usuario_id=? AND es_predeterminada=1 LIMIT 1').get(user.id) as any;
  const sucursal_id = sucursalRow?.sucursal_id ?? null;

  const token = firmarToken({ id: user.id, username: user.username, nombre: user.nombre_completo, rol: user.rol, sucursal_id });
  return res.json({ token, usuario: { id: user.id, username: user.username, nombre: user.nombre_completo, rol: user.rol, sucursal_id } });
});
