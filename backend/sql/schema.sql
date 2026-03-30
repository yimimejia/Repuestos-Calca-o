PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL,
  fecha_creacion TEXT NOT NULL,
  fecha_actualizacion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  nombre_completo TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  rol_id TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'activo',
  fecha_creacion TEXT NOT NULL,
  fecha_actualizacion TEXT NOT NULL,
  FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS clientes (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  telefono TEXT,
  documento TEXT,
  direccion TEXT,
  estado TEXT NOT NULL DEFAULT 'activo',
  fecha_creacion TEXT NOT NULL,
  fecha_actualizacion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS productos (
  id TEXT PRIMARY KEY,
  codigo TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  categoria TEXT NOT NULL,
  ubicacion TEXT,
  imagen_url TEXT,
  costo REAL NOT NULL DEFAULT 0,
  precio REAL NOT NULL,
  itbis_tasa REAL NOT NULL DEFAULT 0,
  existencia REAL NOT NULL DEFAULT 0,
  estado TEXT NOT NULL DEFAULT 'activo',
  fecha_creacion TEXT NOT NULL,
  fecha_actualizacion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ventas (
  id TEXT PRIMARY KEY,
  numero_interno TEXT UNIQUE NOT NULL,
  cliente_id TEXT NOT NULL,
  vendedor_id TEXT NOT NULL,
  cajero_id TEXT,
  tipo_venta TEXT NOT NULL CHECK(tipo_venta IN ('contado','credito')),
  estado TEXT NOT NULL,
  subtotal REAL NOT NULL,
  itbis_total REAL NOT NULL,
  total REAL NOT NULL,
  ncf TEXT,
  tipo_comprobante TEXT,
  fecha_comprobante TEXT,
  estado_comprobante TEXT NOT NULL DEFAULT 'emitido',
  motivo_anulacion TEXT,
  bloqueo_usuario_id TEXT,
  bloqueo_terminal_id TEXT,
  bloqueo_desde TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  fecha_creacion TEXT NOT NULL,
  fecha_actualizacion TEXT NOT NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id),
  FOREIGN KEY (vendedor_id) REFERENCES usuarios(id),
  FOREIGN KEY (cajero_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS detalle_ventas (
  id TEXT PRIMARY KEY,
  venta_id TEXT NOT NULL,
  producto_id TEXT NOT NULL,
  codigo_producto TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  cantidad REAL NOT NULL,
  precio_unitario REAL NOT NULL,
  itbis_tasa REAL NOT NULL,
  itbis_monto REAL NOT NULL,
  subtotal_linea REAL NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS pagos (
  id TEXT PRIMARY KEY,
  venta_id TEXT,
  cuenta_por_cobrar_id TEXT,
  tipo_pago TEXT NOT NULL,
  monto_total REAL NOT NULL,
  monto_efectivo REAL NOT NULL DEFAULT 0,
  monto_tarjeta REAL NOT NULL DEFAULT 0,
  monto_transferencia REAL NOT NULL DEFAULT 0,
  referencia TEXT,
  cambio REAL NOT NULL DEFAULT 0,
  fecha_creacion TEXT NOT NULL,
  usuario_id TEXT NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id)
);

CREATE TABLE IF NOT EXISTS cuentas_por_cobrar (
  id TEXT PRIMARY KEY,
  venta_id TEXT UNIQUE NOT NULL,
  cliente_id TEXT NOT NULL,
  monto_original REAL NOT NULL,
  balance_pendiente REAL NOT NULL,
  fecha_emision TEXT NOT NULL,
  fecha_vencimiento TEXT,
  condicion_credito TEXT,
  estado TEXT NOT NULL,
  observaciones TEXT,
  usuario_creador_id TEXT NOT NULL,
  usuario_autorizador_id TEXT,
  fecha_creacion TEXT NOT NULL,
  fecha_actualizacion TEXT NOT NULL,
  FOREIGN KEY (venta_id) REFERENCES ventas(id),
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS cobros_cxc (
  id TEXT PRIMARY KEY,
  cuenta_por_cobrar_id TEXT NOT NULL,
  pago_id TEXT NOT NULL,
  monto_abono REAL NOT NULL,
  fecha_creacion TEXT NOT NULL,
  usuario_id TEXT NOT NULL,
  FOREIGN KEY (cuenta_por_cobrar_id) REFERENCES cuentas_por_cobrar(id),
  FOREIGN KEY (pago_id) REFERENCES pagos(id)
);

CREATE TABLE IF NOT EXISTS cuadres (
  id TEXT PRIMARY KEY,
  numero_cuadre TEXT UNIQUE NOT NULL,
  cajero_id TEXT NOT NULL,
  admin_autorizador_id TEXT NOT NULL,
  total_contado REAL NOT NULL,
  total_esperado REAL NOT NULL,
  diferencia REAL NOT NULL,
  total_ventas_contado REAL NOT NULL,
  total_ventas_credito REAL NOT NULL,
  total_abonos_credito REAL NOT NULL,
  total_efectivo REAL NOT NULL,
  total_tarjeta REAL NOT NULL,
  total_transferencia REAL NOT NULL,
  total_mixto REAL NOT NULL,
  cantidad_ventas INTEGER NOT NULL,
  fecha_creacion TEXT NOT NULL,
  estado TEXT NOT NULL DEFAULT 'cerrado'
);

CREATE TABLE IF NOT EXISTS detalle_cuadres (
  id TEXT PRIMARY KEY,
  cuadre_id TEXT NOT NULL,
  denominacion INTEGER NOT NULL,
  cantidad INTEGER NOT NULL,
  subtotal REAL NOT NULL,
  FOREIGN KEY (cuadre_id) REFERENCES cuadres(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auditoria_logs (
  id TEXT PRIMARY KEY,
  entidad TEXT NOT NULL,
  entidad_id TEXT NOT NULL,
  accion TEXT NOT NULL,
  descripcion TEXT,
  usuario_id TEXT,
  terminal_id TEXT,
  fecha_creacion TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sync_outbox (
  id TEXT PRIMARY KEY,
  entidad TEXT NOT NULL,
  entidad_id TEXT NOT NULL,
  tipo_evento TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  estado_sync TEXT NOT NULL DEFAULT 'pendiente',
  intentos INTEGER NOT NULL DEFAULT 0,
  ultimo_error TEXT,
  fecha_creacion TEXT NOT NULL,
  fecha_actualizacion TEXT NOT NULL
);
