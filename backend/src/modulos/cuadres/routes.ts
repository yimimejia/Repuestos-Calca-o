import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../../db/connection.js';
import { auth, permitir } from '../../shared/auth.js';
import { env } from '../../config/env.js';
import { emitir } from '../../realtime/hub.js';

const cuadreRouter = Router();
const ahora = () => new Date().toISOString();
const DENOMINACIONES = [2000,1000,500,200,100,50,25,10,5,1];

cuadreRouter.use(auth);

function desdeUltimoCuadre() {
  const last = db.prepare('SELECT fecha_creacion FROM cuadres ORDER BY fecha_creacion DESC LIMIT 1').get() as any;
  return last?.fecha_creacion ?? '1970-01-01T00:00:00.000Z';
}

cuadreRouter.get('/resumen', permitir('cajero','administrador'), (_req, res) => {
  const desde = desdeUltimoCuadre();
  const cobros = db.prepare(`SELECT
      SUM(monto_efectivo) as efectivo,
      SUM(monto_tarjeta) as tarjeta,
      SUM(monto_transferencia) as transferencia,
      SUM(CASE WHEN tipo_pago='mixto' THEN monto_total ELSE 0 END) as mixto,
      COUNT(*) as cantidad
    FROM pagos WHERE fecha_creacion >= ?`).get(desde) as any;

  const creditos = db.prepare(`SELECT COUNT(*) as cantidad, COALESCE(SUM(total),0) as total_credito
    FROM ventas WHERE tipo_venta='credito' AND fecha_creacion >= ?`).get(desde) as any;

  const abonos = db.prepare(`SELECT COALESCE(SUM(c.monto_abono),0) as total_abonos
    FROM cobros_cxc c WHERE c.fecha_creacion >= ?`).get(desde) as any;

  const esperado = Number(cobros.efectivo ?? 0);
  res.json({ desde, esperado, cobros, creditos, abonos });
});

cuadreRouter.post('/cerrar', permitir('cajero','administrador'), (req, res) => {
  const usuario = (req as any).usuario;
  const { admin_password, denominaciones } = req.body as { admin_password: string; denominaciones: Record<string, number> };
  if (admin_password !== env.adminOverridePassword) return res.status(403).json({ error: 'Autorización admin inválida' });

  const desde = desdeUltimoCuadre();
  const resumen = db.prepare(`SELECT
      COALESCE(SUM(monto_efectivo),0) as efectivo,
      COALESCE(SUM(monto_tarjeta),0) as tarjeta,
      COALESCE(SUM(monto_transferencia),0) as transferencia,
      COALESCE(SUM(CASE WHEN tipo_pago='mixto' THEN monto_total ELSE 0 END),0) as mixto,
      COUNT(*) as cantidad
    FROM pagos WHERE fecha_creacion >= ?`).get(desde) as any;
  const ventasContado = db.prepare(`SELECT COALESCE(SUM(total),0) as total FROM ventas WHERE tipo_venta='contado' AND estado='cobrada' AND fecha_actualizacion>=?`).get(desde) as any;
  const ventasCredito = db.prepare(`SELECT COALESCE(SUM(total),0) as total FROM ventas WHERE tipo_venta='credito' AND fecha_creacion>=?`).get(desde) as any;
  const abonosCredito = db.prepare(`SELECT COALESCE(SUM(monto_abono),0) as total FROM cobros_cxc WHERE fecha_creacion>=?`).get(desde) as any;

  let totalContado = 0;
  for (const d of DENOMINACIONES) totalContado += d * Number(denominaciones?.[String(d)] ?? 0);
  const esperado = Number(resumen.efectivo);
  const diferencia = totalContado - esperado;
  const now = ahora();
  const cuadreId = uuid();

  db.prepare(`INSERT INTO cuadres(id,numero_cuadre,cajero_id,admin_autorizador_id,total_contado,total_esperado,diferencia,total_ventas_contado,total_ventas_credito,total_abonos_credito,total_efectivo,total_tarjeta,total_transferencia,total_mixto,cantidad_ventas,fecha_creacion)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(cuadreId, `C-${Date.now()}`, usuario.id, usuario.id, totalContado, esperado, diferencia, ventasContado.total, ventasCredito.total, abonosCredito.total, resumen.efectivo, resumen.tarjeta, resumen.transferencia, resumen.mixto, resumen.cantidad, now);

  const ins = db.prepare('INSERT INTO detalle_cuadres(id,cuadre_id,denominacion,cantidad,subtotal) VALUES(?,?,?,?,?)');
  for (const d of DENOMINACIONES) {
    const cant = Number(denominaciones?.[String(d)] ?? 0);
    ins.run(uuid(), cuadreId, d, cant, d * cant);
  }

  emitir('cuadre_cerrado', { cuadre_id: cuadreId, totalContado, esperado, diferencia });
  res.json({ ok: true, cuadre_id: cuadreId, totalContado, esperado, diferencia });
});

cuadreRouter.get('/historial', permitir('cajero','administrador'), (_req, res) => {
  const rows = db.prepare('SELECT * FROM cuadres ORDER BY fecha_creacion DESC').all();
  res.json(rows);
});

export { cuadreRouter };
