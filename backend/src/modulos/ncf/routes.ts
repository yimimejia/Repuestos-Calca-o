import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/connection.js';
import { auth, permitir, permitirCapacidad } from '../../shared/auth.js';

const ncfRouter = Router();
ncfRouter.use(auth);

const now = () => new Date().toISOString();

function formatNcf(prefijo: string, secuencia: number) {
  return `${prefijo}${String(secuencia).padStart(8, '0')}`;
}

ncfRouter.get('/types', permitir('administrador', 'cajero', 'vendedor', 'revendedor'), (_req, res) => {
  const rows = db.prepare(`SELECT t.*, s.secuencia_inicial, s.secuencia_actual, s.secuencia_final
    FROM ncf_types t
    JOIN ncf_sequences s ON s.ncf_type_id=t.id
    ORDER BY t.nombre ASC`).all();
  res.json(rows);
});

ncfRouter.get('/next/:codigo', permitir('administrador', 'cajero', 'vendedor', 'revendedor'), (req, res) => {
  const row = db.prepare(`SELECT t.id, t.codigo, t.prefijo_fiscal, s.secuencia_actual, s.secuencia_final
    FROM ncf_types t JOIN ncf_sequences s ON s.ncf_type_id=t.id
    WHERE t.codigo=? AND t.activo=1`).get(req.params.codigo) as any;
  if (!row) return res.status(404).json({ error: 'Tipo NCF no encontrado' });
  if (row.secuencia_actual > row.secuencia_final) return res.status(409).json({ error: 'Secuencia agotada' });
  return res.json({ codigo: row.codigo, siguiente: formatNcf(row.prefijo_fiscal, Number(row.secuencia_actual)), secuencia_actual: row.secuencia_actual });
});

ncfRouter.post('/types', permitir('administrador'), permitirCapacidad('can_manage_ncf'), (req, res) => {
  const { nombre, codigo, prefijo_fiscal, secuencia_inicial = 1, secuencia_final = 99999999, observaciones } = req.body;
  if (!nombre || !codigo || !prefijo_fiscal) return res.status(400).json({ error: 'Campos obligatorios incompletos' });
  const id = uuid();
  const ts = now();
  const tx = db.transaction(() => {
    db.prepare(`INSERT INTO ncf_types(id,nombre,codigo,prefijo_fiscal,activo,observaciones,fecha_creacion,fecha_actualizacion)
      VALUES(?,?,?,?,1,?,?,?)`).run(id, nombre, codigo, prefijo_fiscal, observaciones ?? null, ts, ts);
    db.prepare(`INSERT INTO ncf_sequences(id,ncf_type_id,secuencia_inicial,secuencia_actual,secuencia_final,fecha_creacion,fecha_actualizacion)
      VALUES(?,?,?,?,?,?,?)`).run(uuid(), id, secuencia_inicial, secuencia_inicial, secuencia_final, ts, ts);
  });
  tx();
  res.status(201).json({ ok: true, id });
});

ncfRouter.put('/types/:id', permitir('administrador'), permitirCapacidad('can_manage_ncf'), (req, res) => {
  const { nombre, prefijo_fiscal, activo, observaciones, secuencia_inicial, secuencia_actual, secuencia_final } = req.body;
  const ts = now();
  const tx = db.transaction(() => {
    db.prepare('UPDATE ncf_types SET nombre=COALESCE(?,nombre), prefijo_fiscal=COALESCE(?,prefijo_fiscal), activo=COALESCE(?,activo), observaciones=?, fecha_actualizacion=? WHERE id=?')
      .run(nombre ?? null, prefijo_fiscal ?? null, activo ?? null, observaciones ?? null, ts, req.params.id);
    db.prepare('UPDATE ncf_sequences SET secuencia_inicial=COALESCE(?,secuencia_inicial), secuencia_actual=COALESCE(?,secuencia_actual), secuencia_final=COALESCE(?,secuencia_final), fecha_actualizacion=? WHERE ncf_type_id=?')
      .run(secuencia_inicial ?? null, secuencia_actual ?? null, secuencia_final ?? null, ts, req.params.id);
  });
  tx();
  res.json({ ok: true });
});

export { ncfRouter, formatNcf };
