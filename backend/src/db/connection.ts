import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';

const db = new Database(env.dbPath);
const schemaPath = path.resolve(process.cwd(), 'sql/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

// Migración del sistema legacy AuroraOcean (SQL Server → SQLite)
const legacySchemaPath = path.resolve(process.cwd(), 'sql/legacy_schema.sql');
if (fs.existsSync(legacySchemaPath)) {
  const legacySchema = fs.readFileSync(legacySchemaPath, 'utf-8');
  db.exec(legacySchema);
}

function tieneColumna(tabla: string, columna: string) {
  const cols = db.prepare(`PRAGMA table_info(${tabla})`).all() as Array<{ name: string }>;
  return cols.some((c) => c.name === columna);
}

function agregarColumnaSiFalta(tabla: string, columnaDef: string, nombreColumna: string) {
  if (!tieneColumna(tabla, nombreColumna)) {
    db.exec(`ALTER TABLE ${tabla} ADD COLUMN ${columnaDef}`);
  }
}

function asegurarMigraciones() {
  db.exec('PRAGMA foreign_keys = ON');

  // Extensiones de clientes
  agregarColumnaSiFalta('clientes', 'codigo TEXT', 'codigo');
  agregarColumnaSiFalta('clientes', 'sucursal_id TEXT', 'sucursal_id');
  agregarColumnaSiFalta('clientes', 'clase_cliente TEXT', 'clase_cliente');
  agregarColumnaSiFalta('clientes', 'cedula_rnc TEXT', 'cedula_rnc');
  agregarColumnaSiFalta('clientes', 'representante TEXT', 'representante');
  agregarColumnaSiFalta('clientes', 'correo TEXT', 'correo');
  agregarColumnaSiFalta('clientes', 'fecha_nacimiento TEXT', 'fecha_nacimiento');
  agregarColumnaSiFalta('clientes', 'telefono_1 TEXT', 'telefono_1');
  agregarColumnaSiFalta('clientes', 'telefono_2 TEXT', 'telefono_2');
  agregarColumnaSiFalta('clientes', 'limite_credito REAL NOT NULL DEFAULT 0', 'limite_credito');
  agregarColumnaSiFalta('clientes', 'limite_tiempo_dias INTEGER NOT NULL DEFAULT 0', 'limite_tiempo_dias');
  agregarColumnaSiFalta('clientes', 'tipo_cliente TEXT', 'tipo_cliente');
  agregarColumnaSiFalta('clientes', "estatus_credito TEXT NOT NULL DEFAULT 'abierto'", 'estatus_credito');
  agregarColumnaSiFalta('clientes', 'foto_url TEXT', 'foto_url');
  agregarColumnaSiFalta('clientes', 'porcentaje_descuento REAL NOT NULL DEFAULT 0', 'porcentaje_descuento');
  agregarColumnaSiFalta('clientes', "tipo_comprobante_fiscal TEXT NOT NULL DEFAULT 'consumidor_final'", 'tipo_comprobante_fiscal');

  // Extensiones de productos
  agregarColumnaSiFalta('productos', 'ubicacion TEXT', 'ubicacion');
  agregarColumnaSiFalta('productos', 'imagen_url TEXT', 'imagen_url');
  agregarColumnaSiFalta('productos', 'costo REAL NOT NULL DEFAULT 0', 'costo');
  agregarColumnaSiFalta('productos', 'tipo TEXT', 'tipo');
  agregarColumnaSiFalta('productos', 'marca TEXT', 'marca');
  agregarColumnaSiFalta('productos', 'medida TEXT', 'medida');
  agregarColumnaSiFalta('productos', 'lleva_itbis INTEGER NOT NULL DEFAULT 1', 'lleva_itbis');
  agregarColumnaSiFalta('productos', 'margen REAL NOT NULL DEFAULT 0', 'margen');
  agregarColumnaSiFalta('productos', 'itbis_porcentaje REAL NOT NULL DEFAULT 18', 'itbis_porcentaje');
  agregarColumnaSiFalta('productos', 'existencia_minima REAL NOT NULL DEFAULT 0', 'existencia_minima');
  agregarColumnaSiFalta('productos', 'cantidad_a_ordenar REAL NOT NULL DEFAULT 0', 'cantidad_a_ordenar');
  agregarColumnaSiFalta('productos', 'codigo_barras TEXT', 'codigo_barras');
  agregarColumnaSiFalta('productos', 'cuenta_contable TEXT', 'cuenta_contable');
  agregarColumnaSiFalta('productos', 'referencia TEXT', 'referencia');
  agregarColumnaSiFalta('productos', 'uso_notas TEXT', 'uso_notas');
  agregarColumnaSiFalta('productos', 'suplidor_principal_id TEXT', 'suplidor_principal_id');

  // Extensiones de ventas
  agregarColumnaSiFalta('ventas', 'sucursal_id TEXT', 'sucursal_id');
  agregarColumnaSiFalta('ventas', 'forma_pago TEXT', 'forma_pago');
  agregarColumnaSiFalta('ventas', 'descuento_total REAL NOT NULL DEFAULT 0', 'descuento_total');
  agregarColumnaSiFalta('ventas', 'balance_pendiente REAL NOT NULL DEFAULT 0', 'balance_pendiente');

  // Tabla sucursales
  db.exec(`CREATE TABLE IF NOT EXISTS sucursales (
    id TEXT PRIMARY KEY,
    codigo TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    direccion TEXT,
    telefono TEXT,
    estado TEXT NOT NULL DEFAULT 'activa',
    configuracion_fiscal_json TEXT,
    fecha_creacion TEXT NOT NULL,
    fecha_actualizacion TEXT NOT NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS usuarios_sucursales (
    id TEXT PRIMARY KEY,
    usuario_id TEXT NOT NULL,
    sucursal_id TEXT NOT NULL,
    es_predeterminada INTEGER NOT NULL DEFAULT 0,
    fecha_creacion TEXT NOT NULL,
    UNIQUE(usuario_id, sucursal_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id)
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS suplidores (
    id TEXT PRIMARY KEY,
    codigo TEXT UNIQUE,
    nombre_comercial TEXT NOT NULL,
    razon_social TEXT,
    rnc_cedula TEXT,
    telefono TEXT,
    correo TEXT,
    direccion TEXT,
    contacto TEXT,
    estado TEXT NOT NULL DEFAULT 'activo',
    observaciones TEXT,
    fecha_creacion TEXT NOT NULL,
    fecha_actualizacion TEXT NOT NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS categorias (
    id TEXT PRIMARY KEY,
    codigo TEXT UNIQUE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    estado TEXT NOT NULL DEFAULT 'activa',
    fecha_creacion TEXT NOT NULL,
    fecha_actualizacion TEXT NOT NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS inventario_sucursal (
    id TEXT PRIMARY KEY,
    sucursal_id TEXT NOT NULL,
    producto_id TEXT NOT NULL,
    stock REAL NOT NULL DEFAULT 0,
    fecha_creacion TEXT NOT NULL,
    fecha_actualizacion TEXT NOT NULL,
    UNIQUE(sucursal_id, producto_id),
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id TEXT PRIMARY KEY,
    sucursal_id TEXT NOT NULL,
    producto_id TEXT NOT NULL,
    tipo TEXT NOT NULL,
    referencia_tipo TEXT,
    referencia_id TEXT,
    cantidad REAL NOT NULL,
    stock_anterior REAL NOT NULL,
    stock_nuevo REAL NOT NULL,
    observaciones TEXT,
    usuario_id TEXT,
    fecha_creacion TEXT NOT NULL,
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    FOREIGN KEY (producto_id) REFERENCES productos(id)
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS compras (
    id TEXT PRIMARY KEY,
    codigo_compra TEXT UNIQUE NOT NULL,
    suplidor_id TEXT NOT NULL,
    numero_factura TEXT,
    numero_ncf TEXT,
    fecha_factura TEXT NOT NULL,
    fecha_vencimiento TEXT,
    sucursal_id TEXT NOT NULL,
    empleado_id TEXT,
    condicion_compra TEXT NOT NULL CHECK(condicion_compra IN ('contado','credito')),
    estado_pago TEXT NOT NULL DEFAULT 'pendiente',
    estado TEXT NOT NULL DEFAULT 'activa',
    observaciones TEXT,
    subtotal REAL NOT NULL,
    itbis_total REAL NOT NULL,
    descuento_total REAL NOT NULL,
    total REAL NOT NULL,
    fecha_creacion TEXT NOT NULL,
    fecha_actualizacion TEXT NOT NULL,
    FOREIGN KEY (suplidor_id) REFERENCES suplidores(id),
    FOREIGN KEY (sucursal_id) REFERENCES sucursales(id),
    FOREIGN KEY (empleado_id) REFERENCES usuarios(id)
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS detalle_compras (
    id TEXT PRIMARY KEY,
    compra_id TEXT NOT NULL,
    producto_id TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    cantidad REAL NOT NULL,
    costo_unitario REAL NOT NULL,
    itbis_tasa REAL NOT NULL,
    itbis_monto REAL NOT NULL,
    descuento_monto REAL NOT NULL,
    subtotal_linea REAL NOT NULL,
    total_linea REAL NOT NULL,
    FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id)
  )`);



  db.exec(`CREATE TABLE IF NOT EXISTS import_uploads (
    id TEXT PRIMARY KEY,
    nombre_archivo TEXT NOT NULL,
    ruta_archivo TEXT NOT NULL,
    size_bytes INTEGER,
    bytes_recibidos INTEGER NOT NULL DEFAULT 0,
    estado TEXT NOT NULL DEFAULT 'subiendo',
    creado_por TEXT,
    fecha_creacion TEXT NOT NULL,
    fecha_actualizacion TEXT NOT NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS import_jobs (
    id TEXT PRIMARY KEY,
    nombre_archivo TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'analizado',
    motor_origen TEXT,
    motor_destino TEXT NOT NULL DEFAULT 'sqlite',
    resumen_json TEXT,
    errores_json TEXT,
    advertencias_json TEXT,
    confirmado INTEGER NOT NULL DEFAULT 0,
    creado_por TEXT,
    fecha_creacion TEXT NOT NULL,
    fecha_actualizacion TEXT NOT NULL
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS import_staging_rows (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    tabla_legacy TEXT NOT NULL,
    tabla_destino TEXT,
    legacy_key TEXT,
    data_json TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente',
    error TEXT,
    fecha_creacion TEXT NOT NULL,
    FOREIGN KEY (job_id) REFERENCES import_jobs(id) ON DELETE CASCADE
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS import_logs (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    nivel TEXT NOT NULL,
    modulo TEXT,
    mensaje TEXT NOT NULL,
    data_json TEXT,
    fecha_creacion TEXT NOT NULL,
    FOREIGN KEY (job_id) REFERENCES import_jobs(id) ON DELETE CASCADE
  )`);

  db.exec(`CREATE TABLE IF NOT EXISTS import_imported_refs (
    id TEXT PRIMARY KEY,
    job_id TEXT NOT NULL,
    entidad TEXT NOT NULL,
    entidad_id TEXT NOT NULL,
    fecha_creacion TEXT NOT NULL,
    FOREIGN KEY (job_id) REFERENCES import_jobs(id) ON DELETE CASCADE
  )`);

    db.exec('CREATE INDEX IF NOT EXISTS idx_clientes_codigo ON clientes(codigo)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_clientes_doc ON clientes(cedula_rnc)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_productos_barra ON productos(codigo_barras)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_ventas_sucursal ON ventas(sucursal_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_compras_sucursal ON compras(sucursal_id)');
  db.exec('CREATE INDEX IF NOT EXISTS idx_mov_inv_ref ON movimientos_inventario(referencia_tipo, referencia_id)');

  const now = new Date().toISOString();

  const defaultSucursal = db.prepare('SELECT id FROM sucursales LIMIT 1').get() as { id: string } | undefined;
  if (!defaultSucursal) {
    db.prepare('INSERT INTO sucursales(id,codigo,nombre,direccion,telefono,estado,configuracion_fiscal_json,fecha_creacion,fecha_actualizacion) VALUES(lower(hex(randomblob(16))),?,?,?,?,?,?,?,?)')
      .run('PRINCIPAL', 'Sucursal Principal', 'No definida', '', 'activa', JSON.stringify({ ncf_prefijo: 'B01' }), now, now);
  }

  db.prepare("DELETE FROM sucursales WHERE codigo='SUC-11'").run();
}

asegurarMigraciones();

export { db };
