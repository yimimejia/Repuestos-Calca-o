import { v4 as uuid } from 'uuid';
import { db } from './connection.js';
import { hashPassword } from '../shared/security.js';

function ahora() {
  return new Date().toISOString();
}

export function inicializarSeed() {
  const now = ahora();

  // --- ROLES ---
  const roles = ['vendedor', 'cajero', 'administrador', 'al_por_mayor'];
  const ids: Record<string, string> = {};
  for (const r of roles) {
    const exist = db.prepare('SELECT id FROM roles WHERE nombre=?').get(r) as any;
    if (exist?.id) { ids[r] = exist.id; continue; }
    const id = uuid();
    ids[r] = id;
    db.prepare('INSERT INTO roles(id,nombre,fecha_creacion,fecha_actualizacion) VALUES(?,?,?,?)').run(id, r, now, now);
  }
  for (const r of roles) {
    if (!ids[r]) {
      const row = db.prepare('SELECT id FROM roles WHERE nombre=?').get(r) as any;
      if (row) ids[r] = row.id;
    }
  }

  // --- USUARIOS ---
  const usuarios = [
    { username: 'vendedor1', nombre: 'Vendedor Demo 1', pass: '1234', rol: 'vendedor' },
    { username: 'cajero1', nombre: 'Cajero Demo', pass: '1234', rol: 'cajero' },
    { username: 'mayor1', nombre: 'Mayorista Demo', pass: '1234', rol: 'al_por_mayor' },
    { username: 'admin1', nombre: 'Admin Demo', pass: '1234', rol: 'administrador' },
  ];
  for (const u of usuarios) {
    const exu = db.prepare('SELECT id FROM usuarios WHERE username=?').get(u.username) as any;
    if (exu) continue;
    db.prepare(`INSERT INTO usuarios(id,username,nombre_completo,password_hash,rol_id,estado,fecha_creacion,fecha_actualizacion) VALUES(?,?,?,?,?,'activo',?,?)`)
      .run(uuid(), u.username, u.nombre, hashPassword(u.pass), ids[u.rol], now, now);
  }

  const sucursal = db.prepare('SELECT * FROM sucursales ORDER BY fecha_creacion LIMIT 1').get() as any;

  // --- CLIENTES BASE (requeridos para el POS) ---
  const clientesBase = [
    { codigo: 'CLI-0001', nombre: 'Consumidor final', rnc: '', tel: '' },
    { codigo: 'CLI-0002', nombre: 'Portador', rnc: '', tel: '' },
  ];
  for (const c of clientesBase) {
    const ex = db.prepare('SELECT id FROM clientes WHERE codigo=?').get(c.codigo) as any;
    if (ex) continue;
    db.prepare(`INSERT INTO clientes(id,codigo,sucursal_id,nombre,telefono,telefono_1,cedula_rnc,documento,direccion,estado,estatus_credito,tipo_comprobante_fiscal,fecha_creacion,fecha_actualizacion) VALUES(?,?,?,?,?,?,?,?,?,'activo','abierto','consumidor_final',?,?)`)
      .run(uuid(), c.codigo, sucursal?.id ?? null, c.nombre, c.tel, c.tel, c.rnc, '', '', now, now);
  }

  // Categorías, suplidores y productos se gestionan desde la interfaz o via importación.
}
