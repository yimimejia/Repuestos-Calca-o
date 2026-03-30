import { v4 as uuid } from 'uuid';
import { db } from '../../db/connection.js';

const ahora = () => new Date().toISOString();

export function stockSucursal(sucursalId: string, productoId: string) {
  const row = db.prepare('SELECT * FROM inventario_sucursal WHERE sucursal_id=? AND producto_id=?').get(sucursalId, productoId) as any;
  return Number(row?.stock ?? 0);
}

export function ajustarInventario(params: {
  sucursalId: string;
  productoId: string;
  cantidadDelta: number;
  tipo: 'entrada_compra' | 'salida_venta' | 'reversa_compra' | 'reversa_venta' | 'ajuste_manual';
  referenciaTipo?: string;
  referenciaId?: string;
  observaciones?: string;
  usuarioId?: string;
}) {
  const now = ahora();
  const current = db.prepare('SELECT * FROM inventario_sucursal WHERE sucursal_id=? AND producto_id=?').get(params.sucursalId, params.productoId) as any;
  const anterior = Number(current?.stock ?? 0);
  const nuevo = anterior + Number(params.cantidadDelta);

  if (nuevo < -0.0001) {
    throw new Error('Stock insuficiente en la sucursal seleccionada');
  }

  if (!current) {
    db.prepare(`INSERT INTO inventario_sucursal(id,sucursal_id,producto_id,stock,fecha_creacion,fecha_actualizacion)
      VALUES(?,?,?,?,?,?)`).run(uuid(), params.sucursalId, params.productoId, nuevo, now, now);
  } else {
    db.prepare('UPDATE inventario_sucursal SET stock=?, fecha_actualizacion=? WHERE id=?').run(nuevo, now, current.id);
  }

  db.prepare(`INSERT INTO movimientos_inventario(id,sucursal_id,producto_id,tipo,referencia_tipo,referencia_id,cantidad,stock_anterior,stock_nuevo,observaciones,usuario_id,fecha_creacion)
    VALUES(?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(uuid(), params.sucursalId, params.productoId, params.tipo, params.referenciaTipo ?? null, params.referenciaId ?? null, params.cantidadDelta, anterior, nuevo, params.observaciones ?? null, params.usuarioId ?? null, now);

  const total = db.prepare('SELECT COALESCE(SUM(stock),0) as total FROM inventario_sucursal WHERE producto_id=?').get(params.productoId) as any;
  db.prepare('UPDATE productos SET existencia=?, fecha_actualizacion=? WHERE id=?').run(Number(total.total), now, params.productoId);

  return { stockAnterior: anterior, stockNuevo: nuevo };
}
