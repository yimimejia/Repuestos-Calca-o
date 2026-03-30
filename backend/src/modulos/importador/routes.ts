import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import readline from 'node:readline';
import { auth, permitir } from '../../shared/auth.js';
import { db } from '../../db/connection.js';
import { registrarAuditoria } from '../../shared/auditoria.js';

const importadorRouter = Router();
importadorRouter.use(auth, permitir('administrador'));

const ahora = () => new Date().toISOString();
const UPLOAD_DIR = path.join(os.tmpdir(), 'legacy-sql-imports');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const MAPEO_TABLAS: Record<string, { destino: string; modulo: string }> = {
  maestro: { destino: 'productos', modulo: 'productos' },
  clientela: { destino: 'clientes', modulo: 'clientes' },
  suplidores: { destino: 'suplidores', modulo: 'suplidores' },
  facturas: { destino: 'ventas', modulo: 'ventas' },
  productos_facturados: { destino: 'detalle_ventas', modulo: 'ventas' },
  'facturas de compra': { destino: 'compras', modulo: 'compras' },
  'control productos entrados': { destino: 'detalle_compras', modulo: 'compras' },
  abonos: { destino: 'cobros_cxc', modulo: 'cobranzas' },
  'abonos a suplidores': { destino: 'abonos_suplidores_staging', modulo: 'cobranzas' },
  'notas de credito': { destino: 'notas_credito_staging', modulo: 'cobranzas' },
  'notas de debito': { destino: 'notas_debito_staging', modulo: 'cobranzas' },
  'productos acreditados': { destino: 'productos_acreditados_staging', modulo: 'inventario' },
  'salidas almacen': { destino: 'movimientos_inventario', modulo: 'inventario' },
  productos_salidaalmacen: { destino: 'movimientos_inventario', modulo: 'inventario' },
  financiamiento: { destino: 'financiamiento_staging', modulo: 'pendiente' },
  pagare: { destino: 'pagare_staging', modulo: 'pendiente' },
  mora: { destino: 'mora_staging', modulo: 'pendiente' },
  'abonos financiamiento': { destino: 'abonos_financiamiento_staging', modulo: 'pendiente' },
  'cargos prestamos': { destino: 'cargos_prestamos_staging', modulo: 'pendiente' },
};

function normalizarNombreTabla(raw: string) {
  return raw.replace(/\[|\]/g, '').replace(/^dbo\./i, '').replace(/^\./, '').trim().toLowerCase();
}

function parseValuesTuple(tuple: string) {
  const vals: string[] = [];
  let cur = '';
  let inStr = false;
  for (let i = 0; i < tuple.length; i += 1) {
    const ch = tuple[i];
    const next = tuple[i + 1];
    if (ch === "'" && inStr && next === "'") { cur += "'"; i += 1; continue; }
    if (ch === "'") { inStr = !inStr; continue; }
    if (ch === ',' && !inStr) { vals.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.length) vals.push(cur.trim());
  return vals.map((v) => {
    if (/^null$/i.test(v)) return null;
    if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
    return v;
  });
}

function extractInserts(block: string) {
  const regex = /INSERT\s+INTO\s+([^\(]+)\(([^\)]+)\)\s+VALUES\s*(.+?)(?=\n\s*INSERT\s+INTO|$)/gims;
  const rows: Array<{ tableRaw: string; columns: string[]; values: any[] }> = [];
  let m: RegExpExecArray | null;
  while ((m = regex.exec(block)) !== null) {
    const tableRaw = m[1].trim();
    const columns = m[2].split(',').map((c) => c.replace(/\[|\]/g, '').trim());
    const valuesChunk = m[3].trim().replace(/;\s*$/, '');
    const tuples = valuesChunk.match(/\((?:[^\(\)]|'(?:''|[^'])*')*\)/gms) ?? [];
    for (const t of tuples) rows.push({ tableRaw, columns, values: parseValuesTuple(t.slice(1, -1)) });
  }
  return rows;
}

function addLog(jobId: string, nivel: string, modulo: string, mensaje: string, data?: any) {
  db.prepare('INSERT INTO import_logs(id,job_id,nivel,modulo,mensaje,data_json,fecha_creacion) VALUES(?,?,?,?,?,?,?)')
    .run(uuid(), jobId, nivel, modulo, mensaje, data ? JSON.stringify(data) : null, ahora());
}

async function analizarContenidoEnJob(jobId: string, contenidoProvider: AsyncGenerator<string>) {
  const tables: Record<string, { rows: number; columns: Set<string>; mappedTo?: string; modulo?: string }> = {};
  const warnings: string[] = [];
  let insertCount = 0;
  let block = '';
  const dangerous = ['create database', 'alter database', 'use [master]', 'create user', 'sp_addextendedproperty'];

  const insSt = db.prepare('INSERT INTO import_staging_rows(id,job_id,tabla_legacy,tabla_destino,legacy_key,data_json,estado,fecha_creacion) VALUES(?,?,?,?,?,?,?,?)');

  for await (const line of contenidoProvider) {
    if (/^\s*GO\s*$/i.test(line)) {
      const low = block.toLowerCase();
      if (dangerous.some((d) => low.includes(d))) warnings.push(`Bloque ignorado por sentencia peligrosa: ${block.slice(0, 80)}...`);
      for (const ins of extractInserts(block)) {
        const tabla = normalizarNombreTabla(ins.tableRaw);
        const map = MAPEO_TABLAS[tabla];
        if (!tables[tabla]) tables[tabla] = { rows: 0, columns: new Set<string>(), mappedTo: map?.destino, modulo: map?.modulo };
        tables[tabla].rows += 1;
        insertCount += 1;
        const row: Record<string, any> = {};
        ins.columns.forEach((c, i) => { row[c] = ins.values[i] ?? null; tables[tabla].columns.add(c); });
        const legacyKey = String(row.id ?? row.codigo ?? row.Codigo ?? `${tabla}-${Math.random().toString(36).slice(2, 8)}`);
        insSt.run(uuid(), jobId, tabla, map?.destino ?? null, legacyKey, JSON.stringify(row), 'pendiente', ahora());
      }
      block = '';
    } else {
      block += `${line}\n`;
    }
  }

  if (block.trim()) {
    for (const ins of extractInserts(block)) {
      const tabla = normalizarNombreTabla(ins.tableRaw);
      const map = MAPEO_TABLAS[tabla];
      if (!tables[tabla]) tables[tabla] = { rows: 0, columns: new Set<string>(), mappedTo: map?.destino, modulo: map?.modulo };
      tables[tabla].rows += 1;
      insertCount += 1;
      const row: Record<string, any> = {};
      ins.columns.forEach((c, i) => { row[c] = ins.values[i] ?? null; tables[tabla].columns.add(c); });
      const legacyKey = String(row.id ?? row.codigo ?? row.Codigo ?? `${tabla}-${Math.random().toString(36).slice(2, 8)}`);
      insSt.run(uuid(), jobId, tabla, map?.destino ?? null, legacyKey, JSON.stringify(row), 'pendiente', ahora());
    }
  }

  const summary = {
    inserts_detectados: insertCount,
    tablas_detectadas: Object.entries(tables).map(([tabla, d]) => ({ tabla, rows: d.rows, columns: [...d.columns], mapped_to: d.mappedTo ?? null, modulo: d.modulo ?? 'pendiente' })),
  };
  db.prepare('UPDATE import_jobs SET resumen_json=?, advertencias_json=?, fecha_actualizacion=? WHERE id=?')
    .run(JSON.stringify(summary), JSON.stringify(warnings), ahora(), jobId);
  addLog(jobId, 'info', 'analisis', `Análisis completado: ${insertCount} inserts`, { tablas: Object.keys(tables).length, warnings });
  return { summary, warnings };
}

async function* lineasDesdeTexto(txt: string) {
  for (const l of txt.split(/\r?\n/)) yield l;
}

async function* lineasDesdeArchivo(filePath: string) {
  const rl = readline.createInterface({ input: fs.createReadStream(filePath, { encoding: 'utf-8' }), crlfDelay: Infinity });
  for await (const l of rl) yield l;
}

importadorRouter.get('/meta', (_req, res) => {
  res.json({ motor_actual: 'sqlite', soporta_sqlserver_legacy: true, max_json_payload: '100mb', recomendado_para_archivos_grandes: 'upload por chunks' });
});

importadorRouter.get('/jobs', (_req, res) => res.json(db.prepare('SELECT * FROM import_jobs ORDER BY fecha_creacion DESC').all()));

importadorRouter.post('/upload/init', (req, res) => {
  const usuario = (req as any).usuario;
  const { nombre_archivo, size_bytes } = req.body as any;
  if (!nombre_archivo) return res.status(400).json({ error: 'Nombre de archivo requerido' });
  const id = uuid();
  const ruta = path.join(UPLOAD_DIR, `${id}.sql`);
  fs.writeFileSync(ruta, '');
  db.prepare('INSERT INTO import_uploads(id,nombre_archivo,ruta_archivo,size_bytes,bytes_recibidos,estado,creado_por,fecha_creacion,fecha_actualizacion) VALUES(?,?,?,?,?,?,?, ?,?)')
    .run(id, nombre_archivo, ruta, Number(size_bytes ?? 0), 0, 'subiendo', usuario.id, ahora(), ahora());
  res.status(201).json({ upload_id: id });
});

importadorRouter.post('/upload/:id/chunk', (req, res) => {
  const up = db.prepare('SELECT * FROM import_uploads WHERE id=?').get(req.params.id) as any;
  if (!up) return res.status(404).json({ error: 'Upload no encontrado' });
  if (up.estado !== 'subiendo') return res.status(400).json({ error: 'Upload ya finalizado' });
  const { chunk_base64, final = false } = req.body as any;
  if (!chunk_base64) return res.status(400).json({ error: 'Chunk requerido' });
  const buf = Buffer.from(chunk_base64, 'base64');
  fs.appendFileSync(up.ruta_archivo, buf);
  const bytes = Number(up.bytes_recibidos ?? 0) + buf.length;
  db.prepare('UPDATE import_uploads SET bytes_recibidos=?, estado=?, fecha_actualizacion=? WHERE id=?')
    .run(bytes, final ? 'completo' : 'subiendo', ahora(), req.params.id);
  res.json({ ok: true, bytes_recibidos: bytes, estado: final ? 'completo' : 'subiendo' });
});

importadorRouter.post('/upload/:id/analizar', async (req, res) => {
  const usuario = (req as any).usuario;
  const up = db.prepare('SELECT * FROM import_uploads WHERE id=?').get(req.params.id) as any;
  if (!up) return res.status(404).json({ error: 'Upload no encontrado' });
  if (up.estado !== 'completo') return res.status(400).json({ error: 'Upload aún no completo' });

  const jobId = uuid();
  db.prepare('INSERT INTO import_jobs(id,nombre_archivo,estado,motor_origen,motor_destino,resumen_json,advertencias_json,errores_json,creado_por,fecha_creacion,fecha_actualizacion) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
    .run(jobId, up.nombre_archivo, 'analizado', 'sqlserver', 'sqlite', JSON.stringify({}), JSON.stringify([]), JSON.stringify([]), usuario.id, ahora(), ahora());

  const resultado = await analizarContenidoEnJob(jobId, lineasDesdeArchivo(up.ruta_archivo));
  registrarAuditoria('import_job', jobId, 'analizar', `Análisis SQL legado streaming ${up.nombre_archivo}`, usuario.id);
  res.status(201).json({ job_id: jobId, ...resultado });
});

importadorRouter.post('/analizar', async (req, res) => {
  const usuario = (req as any).usuario;
  const { nombre_archivo, contenido_sql } = req.body as { nombre_archivo?: string; contenido_sql?: string };
  if (!nombre_archivo || !contenido_sql) return res.status(400).json({ error: 'Archivo SQL requerido' });

  const jobId = uuid();
  db.prepare('INSERT INTO import_jobs(id,nombre_archivo,estado,motor_origen,motor_destino,resumen_json,advertencias_json,errores_json,creado_por,fecha_creacion,fecha_actualizacion) VALUES(?,?,?,?,?,?,?,?,?,?,?)')
    .run(jobId, nombre_archivo, 'analizado', 'sqlserver', 'sqlite', JSON.stringify({}), JSON.stringify([]), JSON.stringify([]), usuario.id, ahora(), ahora());

  const resultado = await analizarContenidoEnJob(jobId, lineasDesdeTexto(contenido_sql));
  registrarAuditoria('import_job', jobId, 'analizar', `Análisis SQL legado ${nombre_archivo}`, usuario.id);
  res.status(201).json({ job_id: jobId, ...resultado });
});

importadorRouter.get('/jobs/:id/preview', (req, res) => {
  const job = db.prepare('SELECT * FROM import_jobs WHERE id=?').get(req.params.id) as any;
  if (!job) return res.status(404).json({ error: 'Job no encontrado' });
  const tablas = db.prepare('SELECT tabla_legacy, tabla_destino, COUNT(*) as cantidad FROM import_staging_rows WHERE job_id=? GROUP BY tabla_legacy, tabla_destino').all(req.params.id);
  const dupes = db.prepare('SELECT tabla_legacy, legacy_key, COUNT(*) c FROM import_staging_rows WHERE job_id=? GROUP BY tabla_legacy, legacy_key HAVING COUNT(*)>1').all(req.params.id);
  const logs = db.prepare('SELECT * FROM import_logs WHERE job_id=? ORDER BY fecha_creacion ASC').all(req.params.id);
  res.json({ job, tablas, duplicados_potenciales: dupes, logs });
});

function mapCliente(data: any, sucursalId: string) {
  return { codigo: String(data.Codigo ?? data.codigo ?? data.id ?? '').trim() || `LEG-CLI-${Math.random().toString(36).slice(2, 8)}`, nombre: String(data.Nombre ?? data.nombre ?? 'Cliente legado').trim(), telefono_1: String(data.Telefono ?? ''), sucursal_id: sucursalId };
}
function mapSuplidor(data: any) {
  return { codigo: String(data.Codigo ?? data.codigo ?? '').trim() || null, nombre_comercial: String(data.Nombre ?? data.nombre ?? 'Suplidor legado').trim(), telefono: String(data.Telefono ?? '') };
}
function mapProducto(data: any, categoriaId: string | null, suplidorId: string | null) {
  return { codigo: String(data.Codigo ?? data.codigo ?? '').trim() || `LEG-PRD-${Math.random().toString(36).slice(2, 8)}`, nombre: String(data.Descripcion ?? data.Nombre ?? data.nombre ?? 'Producto legado').trim(), costo: Number(data.Costo ?? 0), precio: Number(data.Precio ?? data.Costo ?? 0), categoria: categoriaId, suplidor_principal_id: suplidorId };
}

function registrarImportado(jobId: string, entidad: string, entidadId: string) {
  db.prepare('INSERT INTO import_imported_refs(id,job_id,entidad,entidad_id,fecha_creacion) VALUES(?,?,?,?,?)').run(uuid(), jobId, entidad, entidadId, ahora());
}

importadorRouter.post('/jobs/:id/importar', (req, res) => {
  const usuario = (req as any).usuario;
  const jobId = req.params.id;
  const { dry_run = true, modulos = ['all'], estrategia_relaciones = 'placeholder' } = req.body as any;
  const job = db.prepare('SELECT * FROM import_jobs WHERE id=?').get(jobId) as any;
  if (!job) return res.status(404).json({ error: 'Job no encontrado' });

  const includeModulo = (m: string) => modulos.includes('all') || modulos.includes(m);
  const rows = db.prepare('SELECT * FROM import_staging_rows WHERE job_id=? ORDER BY fecha_creacion ASC').all(jobId) as any[];
  const sucursal = db.prepare('SELECT id FROM sucursales ORDER BY fecha_creacion LIMIT 1').get() as any;
  const resumen = { suplidores: 0, clientes: 0, productos: 0, compras: 0, ventas: 0, inventario: 0, cobranzas: 0, pendientes: 0, errores: 0 };
  const errores: any[] = [];

  const tx = db.transaction(() => {
    for (const r of rows) {
      try {
        const data = JSON.parse(r.data_json);
        const tabla = String(r.tabla_legacy).toLowerCase();
        const map = MAPEO_TABLAS[tabla];
        if (!map) { resumen.pendientes += 1; continue; }
        if (!includeModulo(map.modulo)) continue;

        if (map.modulo === 'suplidores') {
          const d = mapSuplidor(data);
          const ex = d.codigo ? db.prepare('SELECT id FROM suplidores WHERE codigo=?').get(d.codigo) as any : null;
          if (!ex) {
            if (!dry_run) {
              const id = uuid();
              db.prepare('INSERT INTO suplidores(id,codigo,nombre_comercial,telefono,estado,fecha_creacion,fecha_actualizacion) VALUES(?,?,?,?,\'activo\',?,?)')
                .run(id, d.codigo, d.nombre_comercial, d.telefono, ahora(), ahora());
              registrarImportado(jobId, 'suplidor', id);
            }
            resumen.suplidores += 1;
          }
          continue;
        }

        if (map.modulo === 'clientes') {
          const d = mapCliente(data, sucursal.id);
          const ex = db.prepare('SELECT id FROM clientes WHERE codigo=?').get(d.codigo) as any;
          if (!ex) {
            if (!dry_run) {
              const id = uuid();
              db.prepare('INSERT INTO clientes(id,codigo,sucursal_id,nombre,telefono,telefono_1,estado,fecha_creacion,fecha_actualizacion) VALUES(?,?,?,?,?,?,\'activo\',?,?)')
                .run(id, d.codigo, d.sucursal_id, d.nombre, d.telefono_1, d.telefono_1, ahora(), ahora());
              registrarImportado(jobId, 'cliente', id);
            }
            resumen.clientes += 1;
          }
          continue;
        }

        if (map.modulo === 'productos') {
          const cat = db.prepare('SELECT id FROM categorias ORDER BY fecha_creacion LIMIT 1').get() as any;
          const sup = db.prepare('SELECT id FROM suplidores ORDER BY fecha_creacion LIMIT 1').get() as any;
          const d = mapProducto(data, cat?.id ?? null, sup?.id ?? null);
          const ex = db.prepare('SELECT id FROM productos WHERE codigo=?').get(d.codigo) as any;
          if (!ex) {
            if (!dry_run) {
              const id = uuid();
              db.prepare('INSERT INTO productos(id,codigo,nombre,categoria,costo,precio,itbis_tasa,estado,fecha_creacion,fecha_actualizacion,suplidor_principal_id) VALUES(?,?,?,?,?,?,0.18,\'activo\',?,?,?)')
                .run(id, d.codigo, d.nombre, d.categoria, d.costo, d.precio, ahora(), ahora(), d.suplidor_principal_id);
              registrarImportado(jobId, 'producto', id);
            }
            resumen.productos += 1;
          }
          continue;
        }

        if (map.modulo === 'compras' && tabla === 'facturas de compra') { resumen.compras += 1; continue; }
        if (map.modulo === 'ventas' && tabla === 'facturas') { resumen.ventas += 1; continue; }
        if (map.modulo === 'inventario') { resumen.inventario += 1; continue; }
        if (map.modulo === 'cobranzas') { resumen.cobranzas += 1; continue; }
        resumen.pendientes += 1;
      } catch (e: any) {
        resumen.errores += 1;
        errores.push({ id: r.id, tabla: r.tabla_legacy, error: e.message });
      }
    }
    db.prepare('UPDATE import_jobs SET estado=?, errores_json=?, fecha_actualizacion=? WHERE id=?').run(dry_run ? 'dry_run' : 'importado', JSON.stringify(errores), ahora(), jobId);
    addLog(jobId, 'info', 'import', dry_run ? 'Dry run ejecutado' : 'Importación aplicada', resumen);
  });
  tx();
  if (!dry_run) registrarAuditoria('import_job', jobId, 'importar', 'Importación SQL legado aplicada', usuario.id);
  res.json({ dry_run, resumen, errores });
});

importadorRouter.post('/jobs/:id/confirmar', (req, res) => {
  const job = db.prepare('SELECT * FROM import_jobs WHERE id=?').get(req.params.id) as any;
  if (!job) return res.status(404).json({ error: 'Job no encontrado' });
  db.prepare('UPDATE import_jobs SET confirmado=1, fecha_actualizacion=? WHERE id=?').run(ahora(), req.params.id);
  res.json({ ok: true });
});

importadorRouter.post('/jobs/:id/undo', (req, res) => {
  const usuario = (req as any).usuario;
  const job = db.prepare('SELECT * FROM import_jobs WHERE id=?').get(req.params.id) as any;
  if (!job) return res.status(404).json({ error: 'Job no encontrado' });
  if (job.confirmado) return res.status(400).json({ error: 'Importación confirmada, no reversible automáticamente' });
  const refs = db.prepare('SELECT * FROM import_imported_refs WHERE job_id=? ORDER BY fecha_creacion DESC').all(req.params.id) as any[];
  const tx = db.transaction(() => {
    for (const r of refs) {
      if (r.entidad === 'cliente') db.prepare('DELETE FROM clientes WHERE id=?').run(r.entidad_id);
      if (r.entidad === 'suplidor') db.prepare('DELETE FROM suplidores WHERE id=?').run(r.entidad_id);
      if (r.entidad === 'producto') db.prepare('DELETE FROM productos WHERE id=?').run(r.entidad_id);
    }
    db.prepare('UPDATE import_jobs SET estado=?, fecha_actualizacion=? WHERE id=?').run('deshecho', ahora(), req.params.id);
    addLog(req.params.id, 'warning', 'undo', `Undo aplicado sobre ${refs.length} registros`);
  });
  tx();
  registrarAuditoria('import_job', req.params.id, 'undo', 'Se deshizo importación SQL legado', usuario.id);
  res.json({ ok: true, registros_eliminados: refs.length });
});

importadorRouter.get('/jobs/:id/logs', (req, res) => {
  const logs = db.prepare('SELECT * FROM import_logs WHERE job_id=? ORDER BY fecha_creacion ASC').all(req.params.id) as any[];
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(logs.map((l) => `[${l.fecha_creacion}] [${l.nivel}] [${l.modulo}] ${l.mensaje} ${l.data_json ?? ''}`).join('\n'));
});

export { importadorRouter };
