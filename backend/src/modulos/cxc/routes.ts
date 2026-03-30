import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/connection.js';
import { auth, permitir } from '../../shared/auth.js';
import { emitir } from '../../realtime/hub.js';

const cxcRouter = Router();
const ahora = () => new Date().toISOString();
cxcRouter.use(auth);

cxcRouter.get('/pendientes', permitir('cajero', 'administrador', 'vendedor'), (req, res) => {
  const clienteId = req.query.cliente_id as string | undefined;
  const data = clienteId
    ? db.prepare(`SELECT c.*, cl.nombre as cliente_nombre, cl.limite_tiempo_dias, v.numero_interno,
        COALESCE(c.fecha_vencimiento, datetime(c.fecha_emision, '+' || COALESCE(cl.limite_tiempo_dias,0) || ' days')) as fecha_vencimiento_calculada,
        CAST(julianday(COALESCE(c.fecha_vencimiento, datetime(c.fecha_emision, '+' || COALESCE(cl.limite_tiempo_dias,0) || ' days'))) - julianday('now') AS INTEGER) as dias_restantes
      FROM cuentas_por_cobrar c
        JOIN clientes cl ON cl.id=c.cliente_id JOIN ventas v ON v.id=c.venta_id
        WHERE c.balance_pendiente>0 AND c.cliente_id=? ORDER BY c.fecha_emision ASC`).all(clienteId)
    : db.prepare(`SELECT c.*, cl.nombre as cliente_nombre, cl.limite_tiempo_dias, v.numero_interno,
        COALESCE(c.fecha_vencimiento, datetime(c.fecha_emision, '+' || COALESCE(cl.limite_tiempo_dias,0) || ' days')) as fecha_vencimiento_calculada,
        CAST(julianday(COALESCE(c.fecha_vencimiento, datetime(c.fecha_emision, '+' || COALESCE(cl.limite_tiempo_dias,0) || ' days'))) - julianday('now') AS INTEGER) as dias_restantes
      FROM cuentas_por_cobrar c
        JOIN clientes cl ON cl.id=c.cliente_id JOIN ventas v ON v.id=c.venta_id
        WHERE c.balance_pendiente>0 ORDER BY c.fecha_emision ASC`).all();
  res.json(data);
});

cxcRouter.post('/:id/cobrar', permitir('cajero', 'administrador'), (req, res) => {
  const usuario = (req as any).usuario;
  const id = req.params.id;
  const { tipo_pago, monto_efectivo = 0, monto_tarjeta = 0, monto_transferencia = 0, referencia, monto_recibido = 0 } = req.body;
  const cuenta = db.prepare('SELECT * FROM cuentas_por_cobrar WHERE id=?').get(id) as any;
  if (!cuenta) return res.status(404).json({ error: 'Cuenta no encontrada' });

  const total = Number(monto_efectivo) + Number(monto_tarjeta) + Number(monto_transferencia);
  if (total <= 0 || total - cuenta.balance_pendiente > 0.0001) return res.status(400).json({ error: 'Monto inválido' });
  const cambio = tipo_pago === 'efectivo' ? Math.max(0, Number(monto_recibido) - total) : 0;

  const now = ahora();
  const pagoId = uuid();
  db.prepare(`INSERT INTO pagos(id,cuenta_por_cobrar_id,tipo_pago,monto_total,monto_efectivo,monto_tarjeta,monto_transferencia,referencia,cambio,fecha_creacion,usuario_id)
    VALUES(?,?,?,?,?,?,?,?,?,?,?)`)
    .run(pagoId, id, tipo_pago, total, monto_efectivo, monto_tarjeta, monto_transferencia, referencia ?? null, cambio, now, usuario.id);
  db.prepare('INSERT INTO cobros_cxc(id,cuenta_por_cobrar_id,pago_id,monto_abono,fecha_creacion,usuario_id) VALUES(?,?,?,?,?,?)')
    .run(uuid(), id, pagoId, total, now, usuario.id);

  const nuevoBalance = Number(cuenta.balance_pendiente) - total;
  const nuevoEstado = nuevoBalance <= 0.0001 ? 'pagada_total' : 'parcialmente_pagada';
  db.prepare('UPDATE cuentas_por_cobrar SET balance_pendiente=?, estado=?, fecha_actualizacion=? WHERE id=?')
    .run(Math.max(0, nuevoBalance), nuevoEstado, now, id);

  db.prepare("UPDATE ventas SET estado=? WHERE id=? AND tipo_venta='credito'").run(nuevoEstado, cuenta.venta_id);
  emitir('cobro_credito', { cuenta_id: id, monto_abono: total, balance_pendiente: Math.max(0, nuevoBalance) });
  res.json({ ok: true, balance_pendiente: Math.max(0, nuevoBalance), estado: nuevoEstado, cambio });
});

export { cxcRouter };
