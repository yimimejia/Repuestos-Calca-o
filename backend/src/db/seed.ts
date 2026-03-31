import { v4 as uuid } from 'uuid';
import { db } from './connection.js';
import { hashPassword } from '../shared/security.js';

function ahora() {
  return new Date().toISOString();
}

export function inicializarSeed() {
  const now = ahora();

  const roles = ['vendedor', 'cajero', 'administrador', 'al_por_mayor', 'revendedor', 'buscador'];
  const ids: Record<string, string> = {};
  for (const r of roles) {
    const exist = db.prepare('SELECT id FROM roles WHERE nombre=?').get(r) as any;
    if (exist?.id) { ids[r] = exist.id; continue; }
    const id = uuid();
    ids[r] = id;
    db.prepare('INSERT INTO roles(id,nombre,fecha_creacion,fecha_actualizacion) VALUES(?,?,?,?)').run(id, r, now, now);
  }

  const usuarios = [
    { username: 'vendedor1', nombre: 'Vendedor Demo 1', pass: '1234', rol: 'vendedor' },
    { username: 'cajero1', nombre: 'Cajero Demo', pass: '1234', rol: 'cajero' },
    { username: 'mayor1', nombre: 'Mayorista Demo', pass: '1234', rol: 'al_por_mayor' },
    { username: 'reventa1', nombre: 'Revendedor Demo', pass: '1234', rol: 'revendedor' },
    { username: 'picker1', nombre: 'Buscador Demo', pass: '1234', rol: 'buscador' },
    { username: 'admin1', nombre: 'Admin Demo', pass: '1234', rol: 'administrador' },
  ];
  for (const u of usuarios) {
    const exu = db.prepare('SELECT id FROM usuarios WHERE username=?').get(u.username) as any;
    if (exu) continue;
    db.prepare(`INSERT INTO usuarios(id,username,nombre_completo,password_hash,rol_id,estado,fecha_creacion,fecha_actualizacion) VALUES(?,?,?,?,?,'activo',?,?)`)
      .run(uuid(), u.username, u.nombre, hashPassword(u.pass), ids[u.rol], now, now);
  }

  const capacidades = [
    ['can_charge', 'Puede cobrar'],
    ['can_verify', 'Puede verificar pedidos'],
    ['can_assign_picker', 'Puede asignar buscador'],
    ['can_override_price', 'Puede sobreescribir precios'],
    ['can_manage_ncf', 'Puede gestionar NCF'],
    ['can_print_bundle_labels', 'Puede imprimir etiquetas de bulto'],
  ];
  for (const [codigo, nombre] of capacidades) {
    const row = db.prepare('SELECT id FROM capacidades WHERE codigo=?').get(codigo) as any;
    if (!row) db.prepare('INSERT INTO capacidades(id,codigo,nombre,fecha_creacion) VALUES(?,?,?,?)').run(uuid(), codigo, nombre, now);
  }

  const grant = (username: string, caps: string[]) => {
    const user = db.prepare('SELECT id FROM usuarios WHERE username=?').get(username) as any;
    if (!user) return;
    for (const cap of caps) {
      const capRow = db.prepare('SELECT id FROM capacidades WHERE codigo=?').get(cap) as any;
      if (!capRow) continue;
      db.prepare('INSERT OR IGNORE INTO usuario_capacidades(id,usuario_id,capacidad_id,fecha_creacion) VALUES(?,?,?,?)').run(uuid(), user.id, capRow.id, now);
    }
  };

  grant('admin1', capacidades.map((c) => c[0]));
  grant('cajero1', ['can_charge', 'can_assign_picker', 'can_verify', 'can_print_bundle_labels']);
  grant('vendedor1', ['can_verify']);
  grant('mayor1', ['can_override_price']);
  grant('reventa1', ['can_override_price']);

  const ncfDefaults = [
    ['consumidor_final', 'Consumidor Final', 'B02'],
    ['credito_fiscal', 'Crédito Fiscal', 'B01'],
    ['gubernamental', 'Gubernamental', 'B15'],
    ['regimen_especial', 'Régimen Especial', 'B14'],
    ['exportacion', 'Exportación', 'B16'],
  ];

  for (const [codigo, nombre, prefijo] of ncfDefaults) {
    let row = db.prepare('SELECT id FROM ncf_types WHERE codigo=?').get(codigo) as any;
    if (!row) {
      const id = uuid();
      db.prepare(`INSERT INTO ncf_types(id,nombre,codigo,prefijo_fiscal,activo,fecha_creacion,fecha_actualizacion) VALUES(?,?,?,?,1,?,?)`)
        .run(id, nombre, codigo, prefijo, now, now);
      row = { id };
    }
    const seq = db.prepare('SELECT id FROM ncf_sequences WHERE ncf_type_id=?').get(row.id) as any;
    if (!seq) {
      db.prepare('INSERT INTO ncf_sequences(id,ncf_type_id,secuencia_inicial,secuencia_actual,secuencia_final,fecha_creacion,fecha_actualizacion) VALUES(?,?,?,?,?,?,?)')
        .run(uuid(), row.id, 1, 1, 99999999, now, now);
    }
  }

  const sucursal = db.prepare('SELECT * FROM sucursales ORDER BY fecha_creacion LIMIT 1').get() as any;

  const clientesBase = [
    { codigo: 'CLI-0001', nombre: 'CONSUMIDOR FINAL', rnc: '', tel: '' },
    { codigo: 'CLI-0002', nombre: 'Portador', rnc: '', tel: '' },
  ];
  for (const c of clientesBase) {
    const ex = db.prepare('SELECT id FROM clientes WHERE codigo=?').get(c.codigo) as any;
    if (ex) continue;
    db.prepare(`INSERT INTO clientes(id,codigo,sucursal_id,nombre,telefono,telefono_1,cedula_rnc,documento,direccion,estado,estatus_credito,tipo_comprobante_fiscal,fecha_creacion,fecha_actualizacion) VALUES(?,?,?,?,?,?,?,?,?,'activo','abierto','consumidor_final',?,?)`)
      .run(uuid(), c.codigo, sucursal?.id ?? null, c.nombre, c.tel, c.tel, c.rnc, '', '', now, now);
  }
}
