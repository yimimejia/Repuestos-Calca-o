import { Router } from 'express';
import { auth } from '../../shared/auth.js';
import { db } from '../../db/connection.js';

const dashboardRouter = Router();
dashboardRouter.use(auth);

dashboardRouter.get('/kpis', (_req, res) => {
  const desdeUltimoCuadre = (db.prepare('SELECT fecha_creacion FROM cuadres ORDER BY fecha_creacion DESC LIMIT 1').get() as any)?.fecha_creacion ?? '1970-01-01T00:00:00.000Z';
  const pendientes = db.prepare("SELECT COUNT(*) as c FROM ventas WHERE estado IN ('enviada_a_caja','en_caja')").get() as any;
  const esperado = db.prepare(`SELECT COALESCE(SUM(v.total),0) as total
    FROM ventas v
    WHERE v.tipo_venta='contado'
      AND v.estado IN ('enviada_a_caja','en_caja','cobrada')
      AND v.fecha_creacion >= ?`).get(desdeUltimoCuadre) as any;
  const creditoPeriodo = db.prepare("SELECT COALESCE(SUM(total),0) as total FROM ventas WHERE tipo_venta='credito'").get() as any;
  const cobros = db.prepare('SELECT COALESCE(SUM(monto_total),0) as total, COUNT(*) as cantidad FROM pagos').get() as any;
  const beneficios = db.prepare(`SELECT COALESCE(SUM(
      (SELECT COALESCE(SUM(dv.cantidad * (dv.precio_unitario - COALESCE(p.costo,0))),0)
       FROM detalle_ventas dv
       LEFT JOIN productos p ON p.id=dv.producto_id
       WHERE dv.venta_id=v.id)
      - COALESCE(v.descuento_total,0)
    ),0) as total
    FROM ventas v
    WHERE v.estado <> 'anulada'`).get() as any;
  const clientesPend = db.prepare('SELECT COUNT(DISTINCT cliente_id) as c FROM cuentas_por_cobrar WHERE balance_pendiente > 0').get() as any;
  const syncPend = db.prepare("SELECT COUNT(*) as c FROM sync_outbox WHERE estado_sync='pendiente'").get() as any;

  res.json({
    ventas_pendientes: pendientes.c,
    caja_esperada: esperado.total,
    ventas_credito: creditoPeriodo.total,
    cobros_total: cobros.total,
    cobros_cantidad: cobros.cantidad,
    beneficio_neto: beneficios.total,
    clientes_con_balance: clientesPend.c,
    sync_pendiente: syncPend.c,
  });
});

dashboardRouter.get('/admin-resumen', (_req, res) => {
  const hoy = new Date().toISOString().slice(0, 10);
  const ventasDia = db.prepare(`SELECT COUNT(*) as cantidad, COALESCE(SUM(total),0) as total
    FROM ventas WHERE substr(fecha_creacion,1,10)=?`).get(hoy) as any;
  const cobradasDia = db.prepare(`SELECT COUNT(*) as cantidad, COALESCE(SUM(total),0) as total
    FROM ventas WHERE estado='cobrada' AND substr(fecha_actualizacion,1,10)=?`).get(hoy) as any;
  const bajoStock = db.prepare(`SELECT codigo,nombre,existencia,categoria
    FROM productos WHERE existencia <= COALESCE(existencia_minima,10) ORDER BY existencia ASC, nombre ASC LIMIT 12`).all();
  const beneficioDia = db.prepare(`SELECT COALESCE(SUM(
      (SELECT COALESCE(SUM(dv.cantidad * (dv.precio_unitario - COALESCE(p.costo,0))),0)
       FROM detalle_ventas dv
       LEFT JOIN productos p ON p.id=dv.producto_id
       WHERE dv.venta_id=v.id)
      - COALESCE(v.descuento_total,0)
    ),0) as total
    FROM ventas v
    WHERE v.estado <> 'anulada' AND substr(v.fecha_creacion,1,10)=?`).get(hoy) as any;
  res.json({
    fecha: hoy,
    ventas_dia: ventasDia,
    cobradas_dia: cobradasDia,
    beneficio_dia: beneficioDia.total,
    productos_bajo_stock: bajoStock,
  });
});

export { dashboardRouter };
