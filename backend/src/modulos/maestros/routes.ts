import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { auth, permitir } from '../../shared/auth.js';
import { db } from '../../db/connection.js';
import { ajustarInventario } from '../inventario/service.js';
import { registrarAuditoria } from '../../shared/auditoria.js';

const maestrosRouter = Router();
maestrosRouter.use(auth);

maestrosRouter.get('/sucursales', (_req, res) => {
  const rows = db.prepare('SELECT * FROM sucursales ORDER BY nombre').all();
  res.json(rows);
});
maestrosRouter.post('/sucursales', permitir('administrador'), (req, res) => {
  const usuario = (req as any).usuario;
  const d = req.body;
  if (!d.codigo || !d.nombre) return res.status(400).json({ error: 'Código y nombre requeridos' });
  const now = new Date().toISOString();
  const id = uuid();
  db.prepare('INSERT INTO sucursales(id,codigo,nombre,direccion,telefono,estado,configuracion_fiscal_json,fecha_creacion,fecha_actualizacion) VALUES(?,?,?,?,?,?,?,?,?)')
    .run(id, d.codigo, d.nombre, d.direccion ?? '', d.telefono ?? '', d.estado ?? 'activa', JSON.stringify(d.configuracion_fiscal ?? {}), now, now);
  registrarAuditoria('sucursal', id, 'crear', `Sucursal ${d.codigo} creada`, usuario?.id);
  res.status(201).json({ id });
});


maestrosRouter.put('/sucursales/:id', permitir('administrador'), (req, res) => {
  const d = req.body;
  const r = db.prepare('UPDATE sucursales SET codigo=?, nombre=?, direccion=?, telefono=?, estado=?, configuracion_fiscal_json=?, fecha_actualizacion=? WHERE id=?')
    .run(d.codigo, d.nombre, d.direccion ?? '', d.telefono ?? '', d.estado ?? 'activa', JSON.stringify(d.configuracion_fiscal ?? {}), new Date().toISOString(), String(req.params.id));
  if (!r.changes) return res.status(404).json({ error: 'Sucursal no encontrada' });
  res.json({ ok: true });
});

maestrosRouter.delete('/sucursales/:id', permitir('administrador'), (req, res) => {
  const r = db.prepare("UPDATE sucursales SET estado='inactiva', fecha_actualizacion=? WHERE id=?").run(new Date().toISOString(), String(req.params.id));
  if (!r.changes) return res.status(404).json({ error: 'Sucursal no encontrada' });
  res.json({ ok: true });
});

maestrosRouter.get('/categorias', (_req, res) => res.json(db.prepare('SELECT * FROM categorias ORDER BY nombre').all()));
maestrosRouter.post('/categorias', permitir('administrador'), (req, res) => {
  const d = req.body;
  if (!d.nombre) return res.status(400).json({ error: 'Nombre requerido' });
  const now = new Date().toISOString();
  const id = uuid();
  db.prepare('INSERT INTO categorias(id,codigo,nombre,descripcion,estado,fecha_creacion,fecha_actualizacion) VALUES(?,?,?,?,?,?,?)')
    .run(id, d.codigo ?? null, d.nombre, d.descripcion ?? '', 'activa', now, now);
  res.status(201).json({ id });
});

maestrosRouter.put('/categorias/:id', permitir('administrador'), (req, res) => {
  const d = req.body;
  const now = new Date().toISOString();
  const r = db.prepare('UPDATE categorias SET codigo=?, nombre=?, descripcion=?, estado=?, fecha_actualizacion=? WHERE id=?')
    .run(d.codigo ?? null, d.nombre, d.descripcion ?? '', d.estado ?? 'activa', now, String(req.params.id));
  if (!r.changes) return res.status(404).json({ error: 'Categoría no encontrada' });
  res.json({ ok: true });
});

maestrosRouter.delete('/categorias/:id', permitir('administrador'), (req, res) => {
  const r = db.prepare("UPDATE categorias SET estado='inactiva', fecha_actualizacion=? WHERE id=?").run(new Date().toISOString(), String(req.params.id));
  if (!r.changes) return res.status(404).json({ error: 'Categoría no encontrada' });
  res.json({ ok: true });
});

maestrosRouter.get('/suplidores', (_req, res) => {
  res.json(db.prepare('SELECT * FROM suplidores ORDER BY nombre_comercial').all());
});

maestrosRouter.post('/suplidores', permitir('administrador'), (req, res) => {
  const usuario = (req as any).usuario;
  const d = req.body;
  if (!d.nombre_comercial) return res.status(400).json({ error: 'Nombre comercial requerido' });
  if (d.codigo) {
    const ex = db.prepare('SELECT id FROM suplidores WHERE codigo=?').get(d.codigo) as any;
    if (ex) return res.status(409).json({ error: 'Código de suplidor existente' });
  }
  const codigo = String(d.codigo ?? '').trim();
  if (!codigo) return res.status(400).json({ error: 'Código de suplidor requerido' });
  const now = new Date().toISOString();
  const id = codigo;
  const idEx = db.prepare('SELECT id FROM suplidores WHERE id=?').get(id) as any;
  if (idEx) return res.status(409).json({ error: 'ID/Código de suplidor existente' });
  db.prepare(`INSERT INTO suplidores(id,codigo,nombre_comercial,razon_social,rnc_cedula,telefono,correo,direccion,contacto,estado,observaciones,fecha_creacion,fecha_actualizacion)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(id, codigo, d.nombre_comercial, d.razon_social ?? '', d.rnc_cedula ?? '', d.telefono ?? '', d.correo ?? '', d.direccion ?? '', d.contacto ?? '', d.estado ?? 'activo', d.observaciones ?? '', now, now);
  registrarAuditoria('suplidor', id, 'crear', `Suplidor ${d.nombre_comercial} creado`, usuario?.id);
  res.status(201).json({ id });
});

maestrosRouter.put('/suplidores/:id', permitir('administrador'), (req, res) => {
  const usuario = (req as any).usuario;
  const d = req.body;
  const now = new Date().toISOString();
  const r = db.prepare(`UPDATE suplidores SET codigo=?, nombre_comercial=?, razon_social=?, rnc_cedula=?, telefono=?, correo=?, direccion=?, contacto=?, estado=?, observaciones=?, fecha_actualizacion=? WHERE id=?`)
    .run(d.codigo ?? null, d.nombre_comercial, d.razon_social ?? '', d.rnc_cedula ?? '', d.telefono ?? '', d.correo ?? '', d.direccion ?? '', d.contacto ?? '', d.estado ?? 'activo', d.observaciones ?? '', now, String(req.params.id));
  if (!r.changes) return res.status(404).json({ error: 'Suplidor no encontrado' });
  registrarAuditoria('suplidor', String(req.params.id), 'editar', `Suplidor ${d.nombre_comercial} actualizado`, usuario?.id);
  res.json({ ok: true });
});

maestrosRouter.delete('/suplidores/:id', permitir('administrador'), (req, res) => {
  const r = db.prepare("UPDATE suplidores SET estado='inactivo', fecha_actualizacion=? WHERE id=?").run(new Date().toISOString(), String(req.params.id));
  if (!r.changes) return res.status(404).json({ error: 'Suplidor no encontrado' });
  res.json({ ok: true });
});

maestrosRouter.get('/inventario/sucursal/:sucursalId', (req, res) => {
  const rows = db.prepare(`SELECT i.*, p.codigo, p.nombre, p.marca, p.categoria
    FROM inventario_sucursal i JOIN productos p ON p.id=i.producto_id
    WHERE i.sucursal_id=? ORDER BY p.nombre`).all(String(req.params.sucursalId));
  res.json(rows);
});

maestrosRouter.get('/inventario/movimientos', (req, res) => {
  const sucursalId = String((req.query.sucursal_id as string | undefined) ?? '').trim();
  const rows = sucursalId
    ? db.prepare(`SELECT m.*, p.codigo, p.nombre, s.nombre as sucursal_nombre
      FROM movimientos_inventario m JOIN productos p ON p.id=m.producto_id JOIN sucursales s ON s.id=m.sucursal_id
      WHERE m.sucursal_id=? ORDER BY m.fecha_creacion DESC LIMIT 200`).all(sucursalId)
    : db.prepare(`SELECT m.*, p.codigo, p.nombre, s.nombre as sucursal_nombre
      FROM movimientos_inventario m JOIN productos p ON p.id=m.producto_id JOIN sucursales s ON s.id=m.sucursal_id
      ORDER BY m.fecha_creacion DESC LIMIT 200`).all();
  res.json(rows);
});

maestrosRouter.post('/inventario/ajuste', permitir('administrador'), (req, res) => {
  const usuario = (req as any).usuario;
  const d = req.body;
  if (!d.sucursal_id || !d.producto_id || d.cantidad == null) return res.status(400).json({ error: 'Datos incompletos' });
  try {
    const result = ajustarInventario({
      sucursalId: d.sucursal_id,
      productoId: d.producto_id,
      cantidadDelta: Number(d.cantidad),
      tipo: 'ajuste_manual',
      observaciones: d.observaciones ?? 'Ajuste manual',
      usuarioId: usuario?.id,
    });
    registrarAuditoria('inventario', d.producto_id, 'ajuste', `Ajuste ${d.cantidad} en sucursal ${d.sucursal_id}`, usuario?.id);
    res.json({ ok: true, ...result });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

maestrosRouter.get('/inventario/consolidado', (_req, res) => {
  const rows = db.prepare(`SELECT p.id as producto_id, p.codigo, p.nombre, p.existencia,
      COALESCE((SELECT SUM(stock) FROM inventario_sucursal i WHERE i.producto_id=p.id),0) as stock_consolidado
    FROM productos p ORDER BY p.nombre`).all();
  res.json(rows);
});

export { maestrosRouter };
