-- Migración AuroraOcean (SQL Server → SQLite)
-- Generado automáticamente

CREATE TABLE IF NOT EXISTS "Abonos a Suplidores" (
  "Codigo_suplidor" TEXT,
  "Numero_factura" REAL,
  "Fecha_abono" TEXT,
  "Monto_abono" REAL,
  "Tipo_abono" TEXT,
  "Documento" TEXT,
  "Asiento_numero" INTEGER,
  "Numero_recibo" INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "Maestro" (
  "Codigo_articulo" TEXT NOT NULL,
  "Descripcion" TEXT NOT NULL,
  "Marca" TEXT,
  "Unidad" TEXT,
  "Existencia" REAL,
  "Precio_Venta" REAL,
  "Precio_compra" REAL,
  "Existencia_minima" INTEGER,
  "Departamento" TEXT,
  "Cod_Barra" TEXT,
  "Entrada" REAL,
  "Salida" REAL,
  "Opening_balance" REAL,
  "Precio_PEPS" REAL,
  "Precio_UEPS" REAL,
  "Precio_Promedio" REAL,
  "Ubicacion" TEXT,
  "Cantidad_pedir" INTEGER,
  "Foto" BLOB,
  "Categoria" TEXT,
  "Tipo" TEXT,
  "paga_ITBIS" INTEGER,
  "PrecioB" REAL,
  "PrecioC" REAL,
  "PrecioCreditoA" REAL,
  "PrecioCreditoB" REAL,
  "PrecioCreditoC" REAL,
  "Porciento_venta" REAL,
  "Cuenta_asiento" TEXT,
  "Lleva_serial" INTEGER,
  "CodigoBarra_opcional" INTEGER,
  "Cantidad_PorMayor" INTEGER,
  "Precio_PorMayor" REAL,
  "Precio_PorMayorB" REAL,
  "Precio_PorMayorC" REAL,
  "Medida_PorMayor" TEXT,
  "Costo_PorMayor" REAL,
  "Existencia_fisica" REAL,
  "Existencia_fisicaMayor" REAL,
  "ImagenPrevia" TEXT,
  "Foto2" TEXT,
  "Foto3" TEXT,
  "Oferta" TEXT,
  "Estilo" TEXT,
  "Size" TEXT,
  "Suplidor1" TEXT,
  "Suplidor2" TEXT,
  "Suplidor3" TEXT,
  "Porciento_ventaB" REAL,
  "Porciento_ventaC" REAL,
  "Porciento_creditoA" REAL,
  "Porciento_creditoB" REAL,
  "Porciento_creditoC" REAL,
  "Alias" TEXT,
  "ITBIS_diferido" REAL,
  "Referencia" TEXT,
  "FotoUrl" TEXT,
  "Uso" TEXT
);

CREATE TABLE IF NOT EXISTS "Control Productos Entrados" (
  "fila" INTEGER PRIMARY KEY,
  "Numero_compra" REAL,
  "Fecha_compra" TEXT,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Unidad" TEXT,
  "Costo_producto" REAL,
  "Codigo_suplidor" TEXT,
  "Marca" TEXT,
  "Local" TEXT,
  "Codigo_barra" TEXT,
  "Estatus" TEXT,
  "Estatus_fisico" TEXT,
  "id_almacen" INTEGER,
  "Margen" REAL,
  "Paga_ITBIS" INTEGER,
  "Descuento_antes" REAL,
  "Descuento_despues" REAL,
  "Vendedor" TEXT
);

CREATE TABLE IF NOT EXISTS "Abonos Auxiliar" (
  "Numero_recibo" INTEGER,
  "Numero_cuenta" TEXT,
  "Numero_factura" INTEGER,
  "Monto_abono" REAL,
  "Fecha_abono" TEXT,
  "Concepto" TEXT,
  "Tipo_abono" TEXT,
  "Documento" TEXT,
  "Turno" INTEGER,
  "Asiento_numero" INTEGER,
  "Vendedor" TEXT,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Productos_facturados" (
  "Numero_factura" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Cantidad_cred" REAL,
  "Fecha_factura" TEXT,
  "Unidad" TEXT,
  "Cod_barra" TEXT,
  "Factura_compra" INTEGER,
  "Fecha_compra" TEXT,
  "Cod_suplidor" TEXT,
  "Precio_compra" REAL,
  "Fecha_entrada" TEXT,
  "Hora_entrada" TEXT,
  "Fecha_vencimiento" TEXT,
  "Numero_serie" TEXT,
  "ITBIS" REAL,
  "Descuento" REAL,
  "Marca" TEXT,
  "Ano_vencimiento" INTEGER,
  "Mes_vencimiento" INTEGER,
  "id_almacen" INTEGER,
  "Porciento_ITBIS" REAL,
  "Descuento_individual" REAL,
  "Recargo" REAL,
  "Recargo_general" REAL
);

CREATE TABLE IF NOT EXISTS "Facturas" (
  "Numero_factura" INTEGER NOT NULL,
  "Tipo_factura" TEXT,
  "Fecha_factura" TEXT,
  "Vendido_cuenta" TEXT,
  "Direccion_cuenta" TEXT,
  "Monto_factura" REAL,
  "Vencimiento" TEXT,
  "Pagada" TEXT,
  "Descuento" REAL,
  "ITBIS" REAL,
  "Codigo_cuenta" TEXT,
  "Vendedor" TEXT,
  "Mes" INTEGER,
  "Asiento_numero" INTEGER,
  "NCF" TEXT,
  "Tipo_NCF" TEXT,
  "PC" TEXT,
  "Turno" INTEGER,
  "RNC" TEXT,
  "Secuencia" INTEGER,
  "Modo_pago" TEXT,
  "id_almacen" INTEGER,
  "Ship_to" TEXT,
  "Orden_numero" INTEGER,
  "Gravado" REAL,
  "Parte_efectivo" REAL,
  "ITBIS_diferido" REAL,
  "Exento" REAL,
  "Parte_tarjeta" REAL,
  "Parte_cheque" REAL,
  "Parte_NC" REAL,
  "Recargo" REAL
);

CREATE TABLE IF NOT EXISTS "Abonos" (
  "Numero_recibo" INTEGER,
  "Numero_cuenta" TEXT,
  "Numero_factura" INTEGER,
  "Monto_abono" REAL,
  "Fecha_abono" TEXT,
  "Concepto" TEXT,
  "Tipo_abono" TEXT,
  "Documento" TEXT,
  "Asiento_numero" INTEGER,
  "Turno" INTEGER,
  "Vendedor" TEXT,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Salidas Almacen" (
  "Numero_conduce" INTEGER NOT NULL,
  "Fecha_salida" TEXT,
  "Monto_salida" REAL,
  "Vendedor" TEXT,
  "Asiento_numero" INTEGER,
  "id_almacen_salida" INTEGER,
  "id_almacen_entrada" INTEGER,
  "Fecha_entrada" TEXT,
  "Receptor" TEXT,
  "Procesada" TEXT
);

CREATE TABLE IF NOT EXISTS "Productos_SalidaAlmacen" (
  "Numero_conduce" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Cantidad_cred" REAL,
  "Fecha_factura" TEXT,
  "Unidad" TEXT,
  "Cod_barra" TEXT,
  "Factura_compra" INTEGER,
  "Fecha_compra" TEXT,
  "Cod_suplidor" INTEGER,
  "Precio_compra" REAL,
  "Fecha_entrada" TEXT,
  "Hora_entrada" TEXT,
  "Fecha_vencimiento" TEXT,
  "Numero_serie" TEXT,
  "ITBIS" REAL,
  "Descuento" REAL,
  "Marca" TEXT,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Productos Acreditados" (
  "Numero_credito" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Unidad" TEXT,
  "Fecha_vencimiento" TEXT,
  "ITBIS" REAL,
  "Descuento" REAL,
  "Descuento_individual" REAL,
  "Recargo" REAL,
  "Precio_compra" REAL
);

CREATE TABLE IF NOT EXISTS "Notas de Credito" (
  "Numero_credito" INTEGER,
  "Fecha_credito" TEXT,
  "Numero_factura" INTEGER,
  "Monto_credito" REAL,
  "Numero_cuenta" TEXT,
  "Concepto" TEXT,
  "NCF" TEXT,
  "Asiento_numero" INTEGER,
  "Nombre_cliente" TEXT,
  "Turno" INTEGER,
  "Vendedor" TEXT,
  "Secuencia" INTEGER,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Facturas Auxiliar" (
  "Numero_factura" INTEGER NOT NULL,
  "Tipo_factura" TEXT,
  "Fecha_factura" TEXT,
  "Vendido_cuenta" TEXT,
  "Direccion_cuenta" TEXT,
  "Monto_factura" REAL,
  "Vencimiento" TEXT,
  "Pagada" TEXT,
  "Descuento" REAL,
  "ITBIS" REAL,
  "Codigo_cuenta" TEXT,
  "Vendedor" TEXT,
  "Mes" INTEGER,
  "Asiento_numero" INTEGER,
  "NCF" TEXT,
  "Tipo_NCF" TEXT,
  "PC" TEXT,
  "Turno" INTEGER,
  "RNC" TEXT,
  "Secuencia" INTEGER,
  "Modo_pago" TEXT,
  "id_almacen" INTEGER,
  "Ship_to" TEXT,
  "Orden_numero" INTEGER,
  "Gravado" REAL,
  "Parte_efectivo" REAL,
  "ITBIS_diferido" REAL,
  "Exento" REAL
);

CREATE TABLE IF NOT EXISTS "Notas de Credito Auxiliar" (
  "Numero_credito" INTEGER,
  "Fecha_credito" TEXT,
  "Numero_factura" INTEGER,
  "Monto_credito" REAL,
  "Numero_cuenta" TEXT,
  "Concepto" TEXT,
  "NCF" TEXT,
  "Asiento_numero" INTEGER,
  "Nombre_cliente" TEXT,
  "Turno" INTEGER,
  "Vendedor" TEXT,
  "Secuencia" INTEGER,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Notas de Debito" (
  "Numero_Debito" INTEGER,
  "Fecha_Debito" TEXT,
  "Numero_Factura" INTEGER,
  "Monto_Debito" REAL,
  "Numero_Cuenta" TEXT,
  "Concepto" TEXT,
  "NCF" TEXT,
  "Asiento_numero" INTEGER,
  "Nombre_cliente" TEXT,
  "Turno" INTEGER,
  "Vendedor" TEXT,
  "Secuencia" INTEGER,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Notas de Debito Auxiliar" (
  "Numero_Debito" INTEGER,
  "Fecha_Debito" TEXT,
  "Numero_Factura" INTEGER,
  "Monto_Debito" REAL,
  "Numero_Cuenta" TEXT,
  "Concepto" TEXT,
  "NCF" TEXT,
  "Asiento_numero" INTEGER,
  "Nombre_cliente" TEXT,
  "Turno" INTEGER,
  "Vendedor" TEXT,
  "Secuencia" INTEGER,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Pagare" (
  "Numero_pagare" INTEGER,
  "Codigo_cliente" TEXT,
  "Pagada" INTEGER,
  "Fecha_pago" TEXT,
  "Vencida" INTEGER,
  "Fecha_pagare" TEXT,
  "Balance_capital" REAL,
  "Balance_interes" REAL,
  "Capital_acumulado" REAL,
  "Interes_acumulado" REAL,
  "Pagos_acumulados" REAL,
  "Numero_cuota" INTEGER,
  "Interes" REAL,
  "Capital" REAL,
  "Interes_por_dia" REAL,
  "Congelado" INTEGER,
  "Numero_factura" INTEGER,
  "Tipo_prestamo" TEXT,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Mora" (
  "Numero_pagare" INTEGER,
  "Monto_mora" REAL,
  "Numero_prestamo" INTEGER,
  "Codigo_cliente" TEXT,
  "Mora_anterior" REAL,
  "Fecha_anterior" TEXT,
  "Ultima_fecha_mora" TEXT
);

CREATE TABLE IF NOT EXISTS "Abonos Financiamiento" (
  "Numero_pagare" INTEGER,
  "Fecha_abono" TEXT,
  "Monto_abono" REAL,
  "Codigo_cliente" TEXT,
  "Numero_abono" INTEGER NOT NULL,
  "Concepto" TEXT,
  "Numero_prestamo" INTEGER,
  "Capital" REAL,
  "Interes" REAL,
  "Mora" REAL,
  "Avance_capital" REAL,
  "Cargos" REAL,
  "Vendedor" TEXT,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Clientela" (
  "Nombre_cuenta" TEXT,
  "Nombre_cliente" TEXT,
  "Cedula" TEXT,
  "Direccion" TEXT,
  "Telefono1" TEXT,
  "Telefono2" TEXT,
  "Limite_credito" REAL,
  "Limite_tiempo" INTEGER,
  "Abierto" INTEGER,
  "Cerrado" INTEGER,
  "Suma_Creditos" REAL,
  "Foto" TEXT,
  "email" TEXT,
  "Tipo_cliente" TEXT,
  "Fecha_nac" TEXT,
  "Apellido_cliente" TEXT,
  "Ciudad" TEXT,
  "Provincia" TEXT,
  "Codigo_postal" TEXT,
  "password" TEXT,
  "Pregunta_secreta" TEXT,
  "Respuesta_pregunta" TEXT,
  "id_almacen" INTEGER,
  "Codigo_cuenta" TEXT NOT NULL,
  "nos_conocio" TEXT,
  "referenciado_por" TEXT,
  "Porciento_descuento" REAL,
  "Codigo_gerente_area" INTEGER,
  "Datacredito" TEXT,
  "EnCicla" INTEGER,
  "Factor_riezgo" INTEGER,
  "Fecha_ingreso" TEXT,
  "Tipo_NCF" TEXT,
  "Puntos_acumulados" INTEGER,
  "Cuenta_contable" TEXT,
  "Sector" TEXT,
  "Pais" TEXT,
  "Categoria" TEXT,
  "Situacion_credito" TEXT,
  "Empresa_labora" TEXT,
  "Tipo_Empresa_labora" TEXT,
  "Direccion_empresa" TEXT,
  "Ocupacion" TEXT,
  "Posicion" TEXT,
  "Ciudad_empresa" TEXT,
  "Telefono_empresa" TEXT,
  "Fax_empresa" TEXT,
  "Correo_Empresa" TEXT,
  "Clase_cliente" TEXT,
  "Acumula_puntos" INTEGER
);

CREATE TABLE IF NOT EXISTS "Financiamiento" (
  "Numero_pagare" INTEGER,
  "Codigo_cliente" TEXT,
  "Concepto" TEXT,
  "Interes" REAL,
  "Monto_prestamo" REAL,
  "Fecha_prestamo" TEXT,
  "Fecha_inicio" TEXT,
  "Cant_pagos" INTEGER,
  "Finalizado" INTEGER,
  "Agente" TEXT,
  "Congelado" INTEGER,
  "Numero_factura" INTEGER,
  "Modo_pago" TEXT,
  "Tipo_saldo" TEXT,
  "Tipo_prestamo" TEXT,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Cargos Prestamos" (
  "Numero_prestamo" INTEGER,
  "Numero_pagare" INTEGER,
  "Monto_debito" REAL,
  "Codigo_cliente" TEXT
);

CREATE TABLE IF NOT EXISTS "Notas de Credito en Compras Auxiliar" (
  "Numero_credito" INTEGER,
  "Fecha_credito" TEXT,
  "Numero_factura" INTEGER,
  "Monto_credito" REAL,
  "Numero_cuenta" TEXT,
  "Concepto" TEXT,
  "Asiento_numero" INTEGER,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Productos_facturados Auxiliar" (
  "Numero_factura" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Cantidad_cred" REAL,
  "Fecha_factura" TEXT,
  "Unidad" TEXT,
  "Cod_barra" TEXT,
  "Factura_compra" INTEGER,
  "Fecha_compra" TEXT,
  "Cod_suplidor" INTEGER,
  "Precio_compra" REAL,
  "Fecha_entrada" TEXT,
  "Hora_entrada" TEXT,
  "Fecha_vencimiento" TEXT,
  "Numero_serie" TEXT,
  "ITBIS" REAL,
  "Descuento" REAL,
  "Marca" TEXT,
  "Codigo_cuenta" TEXT,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Notas de Credito en Compras" (
  "Numero_credito" INTEGER,
  "Fecha_credito" TEXT,
  "Numero_factura" REAL,
  "Monto_credito" REAL,
  "Numero_cuenta" TEXT,
  "Concepto" TEXT,
  "Asiento_numero" INTEGER,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Notas de Debito en Compras" (
  "Numero_debito" INTEGER,
  "Fecha_debito" TEXT,
  "Numero_factura" REAL,
  "Monto_debito" REAL,
  "Numero_cuenta" TEXT,
  "Concepto" TEXT,
  "Asiento_numero" INTEGER,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Notas de Debito en Compras Auxiliar" (
  "Numero_debito" INTEGER,
  "Fecha_debito" TEXT,
  "Numero_factura" INTEGER,
  "Monto_debito" REAL,
  "Numero_cuenta" TEXT,
  "Concepto" TEXT,
  "Asiento_numero" INTEGER,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Suplidores" (
  "Nombre_suplidor" TEXT,
  "Direccion" TEXT,
  "Ciudad_suplidor" TEXT,
  "Telefono1" TEXT,
  "Telefono2" TEXT,
  "Fax" TEXT,
  "Codigo_sup" TEXT NOT NULL,
  "Vendedor" TEXT,
  "Limite_credito" REAL,
  "Limite_Tiempo" INTEGER,
  "Correo_electronico" TEXT,
  "RNC" TEXT,
  "Proveedor_informal" INTEGER,
  "Tipo_suplidor" TEXT,
  "Cuenta_Contable" TEXT,
  "Password" TEXT,
  "Pregunta_secreta" TEXT,
  "cuenta_bancaria" TEXT,
  "nombre_banco" TEXT
);

CREATE TABLE IF NOT EXISTS "Facturas de Compra" (
  "Codigo_suplidor" TEXT,
  "Numero_factura" REAL,
  "Credito" INTEGER,
  "Contado" INTEGER,
  "Monto" REAL,
  "Fecha_factura" TEXT,
  "Fecha_llegada" TEXT,
  "Vencimiento" TEXT,
  "Pagada" TEXT,
  "Tipo_factura" TEXT,
  "Mercancias" INTEGER,
  "Gastos" INTEGER,
  "Procesada" TEXT,
  "ITBIS" REAL,
  "Flete" REAL,
  "Descuento" REAL,
  "Monto_neto" REAL,
  "Orden_compra" INTEGER,
  "Asiento_numero" INTEGER,
  "NCF" TEXT,
  "Usuario" TEXT,
  "Numero_cuenta" TEXT,
  "Numero_cheque" TEXT,
  "Cuenta_debitar" TEXT,
  "Concepto" TEXT,
  "Cheque" INTEGER,
  "id_almacen" INTEGER,
  "Retenido_2" REAL,
  "Retenido_10" REAL,
  "ITBIS_retenido" REAL
);

CREATE TABLE IF NOT EXISTS "Productos Acreditados Auxiliar" (
  "Numero_credito" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Unidad" TEXT,
  "Fecha_vencimiento" TEXT,
  "ITBIS" REAL,
  "Descuento" REAL,
  "Precio_compra" REAL
);

CREATE TABLE IF NOT EXISTS "Almacenes" (
  "id_almacen" INTEGER PRIMARY KEY,
  "Ubicacion" TEXT,
  "Direccion" TEXT,
  "Telefono" TEXT,
  "Telefono2" TEXT,
  "Ciudad" TEXT,
  "Correo_electronico" TEXT,
  "Gerente_administrador" TEXT,
  "Referencia" TEXT,
  "Decomiso" INTEGER,
  "Usuario_exclusivo" TEXT
);

CREATE TABLE IF NOT EXISTS "Maestro de Empleados" (
  "Numero_empleado" INTEGER NOT NULL,
  "Nombre_empleado" TEXT,
  "Apellido_empleado" TEXT,
  "Fecha_ingreso" TEXT,
  "Salario_Semanal" REAL,
  "Salario_promedio_semanal" REAL,
  "Cedula_empleado" TEXT,
  "Direccion_empleado" TEXT,
  "Telefono" TEXT,
  "Paga_Seguro" INTEGER,
  "Estatus" TEXT,
  "Num_afiliacion" INTEGER,
  "Fecha_salida" TEXT,
  "Sexo" TEXT,
  "Mes_salida" INTEGER,
  "Mes_entrada" INTEGER,
  "Paga_cooperativa" INTEGER,
  "Cant_cooperativa" REAL,
  "Embarazada" TEXT,
  "Fecha_nac" TEXT,
  "Nacionalidad" TEXT,
  "Ocupacion" TEXT,
  "No_liquidable" INTEGER,
  "Paga_SeguroMedico" INTEGER,
  "Cant_SeguroMedico" REAL,
  "foto" TEXT,
  "Numero_cuenta" TEXT,
  "Estado_civil" TEXT,
  "Dependientes" INTEGER,
  "Paga_SeguroDental" INTEGER,
  "Cant_SeguroDental" REAL,
  "Planta" INTEGER,
  "Empleado_fijo" INTEGER,
  "Empleado_produccion" INTEGER,
  "Turno" TEXT,
  "Sueldo_fijo" INTEGER,
  "Paga_AFP" INTEGER,
  "Cant_AFP" REAL,
  "Departamento" TEXT,
  "Paga_ARS" INTEGER,
  "Cant_ARS" REAL,
  "Cobra_incentivo" INTEGER,
  "Cant_incentivo" REAL,
  "Cobra_transporte" INTEGER,
  "Cant_transporte" REAL,
  "Cobra_dieta" INTEGER,
  "Cant_dieta" REAL,
  "Aumento_6meses" TEXT,
  "Aumento_1ano" TEXT,
  "Aumento_2ano" TEXT,
  "Razon_salida" TEXT,
  "Tiene_hijos" INTEGER,
  "Licencia_matrimonial" INTEGER,
  "Fecha_licencia_matrimonial" TEXT,
  "Carnet" INTEGER,
  "Tanda" INTEGER,
  "Email" TEXT,
  "Password" TEXT,
  "Pregunta_secreta" TEXT
);

CREATE TABLE IF NOT EXISTS "Facturas de Compra Auxiliar" (
  "Codigo_suplidor" TEXT,
  "Numero_factura" INTEGER,
  "Credito" INTEGER,
  "Contado" INTEGER,
  "Monto" REAL,
  "Fecha_factura" TEXT,
  "Fecha_llegada" TEXT,
  "Vencimiento" TEXT,
  "Pagada" TEXT,
  "Tipo_factura" TEXT,
  "Mercancias" INTEGER,
  "Gastos" INTEGER,
  "Procesada" TEXT,
  "ITBIS" REAL,
  "Flete" REAL,
  "Descuento" REAL,
  "Monto_neto" REAL,
  "Orden_compra" INTEGER,
  "Asiento_numero" INTEGER,
  "NCF" TEXT,
  "Usuario" TEXT,
  "Retenido_2" REAL,
  "Retenido_10" REAL,
  "ITBIS_retenido" REAL
);

CREATE TABLE IF NOT EXISTS "Cheques" (
  "Numero_cheque" INTEGER,
  "Banco" TEXT,
  "Monto" REAL,
  "Fecha" TEXT,
  "A_Favor" TEXT,
  "Cuenta_numero" TEXT,
  "Impresa" INTEGER,
  "Numero_asiento" INTEGER,
  "Concepto" TEXT,
  "Futurista" INTEGER
);

CREATE TABLE IF NOT EXISTS "Catalogo de Cuentas" (
  "Numero" TEXT NOT NULL,
  "Nombre_cuenta" TEXT,
  "Grupo" TEXT,
  "Tipo" TEXT,
  "Nivel" INTEGER,
  "Cuenta_padre" TEXT,
  "Reconciliable" INTEGER,
  "Grupo_sinPrefijo" TEXT,
  "Origen" TEXT,
  "Debito" REAL,
  "Credito" REAL
);

CREATE TABLE IF NOT EXISTS "Asientos" (
  "Asiento_numero" INTEGER,
  "Fecha_asiento" TEXT,
  "Cuenta_asiento" TEXT,
  "Descripcion" TEXT,
  "Debito" REAL,
  "Credito" REAL,
  "Debito_anterior" REAL,
  "Credito_anterior" REAL,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Asientos_temporal" (
  "fila" INTEGER PRIMARY KEY,
  "Asiento_numero" INTEGER,
  "Fecha_asiento" TEXT,
  "Cuenta_asiento" TEXT,
  "Descripcion" TEXT,
  "Debito" REAL,
  "Credito" REAL,
  "Debito_anterior" REAL,
  "Credito_anterior" REAL,
  "Numero_serie" TEXT
);

CREATE TABLE IF NOT EXISTS "Abonos a Suplidores Auxiliar" (
  "Codigo_suplidor" TEXT,
  "Numero_factura" REAL,
  "Fecha_abono" TEXT,
  "Monto_abono" REAL,
  "Tipo_abono" TEXT,
  "Documento" TEXT,
  "Asiento_numero" INTEGER,
  "Numero_recibo" INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "Abonos_apartados" (
  "Numero_recibo" INTEGER,
  "Numero_cuenta" TEXT,
  "Numero_apartado" INTEGER,
  "Monto_abono" REAL,
  "Fecha_abono" TEXT,
  "Concepto" TEXT,
  "Tipo_abono" TEXT,
  "Documento" TEXT,
  "Turno" INTEGER,
  "Vendedor" TEXT,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Activos Fijos" (
  "Codigo" TEXT,
  "Factura_compra" INTEGER,
  "Cod_suplidor" INTEGER,
  "Descripcion" TEXT,
  "Ubicacion" TEXT,
  "Categoria" INTEGER,
  "Costo_adquisicion" REAL,
  "Fecha_adquisicion" TEXT,
  "Depreciacion_acumulada" REAL,
  "Cuenta_contable" TEXT,
  "Cuenta_gasto" TEXT,
  "Asiento_numero" INTEGER,
  "Modo_compra" TEXT,
  "Numero_cuenta" TEXT,
  "Numero_cheque" INTEGER,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Acumulados Trailler" (
  "Contador" INTEGER,
  "Ultima_nomina" INTEGER
);

CREATE TABLE IF NOT EXISTS "Acumulativo ISR" (
  "Numero_empleado" INTEGER,
  "Mes" INTEGER,
  "Impuesto_acumulado" REAL
);

CREATE TABLE IF NOT EXISTS "AFP Acumulado" (
  "Numero_empleado" INTEGER,
  "AFP_acumulado" REAL
);

CREATE TABLE IF NOT EXISTS "Alias" (
  "fila" INTEGER PRIMARY KEY,
  "Alias" TEXT
);

CREATE TABLE IF NOT EXISTS "Anticipos" (
  "Codigo_cliente" TEXT,
  "Monto_anticipo" REAL,
  "Balance" REAL,
  "Fecha" TEXT,
  "Modo_pago" TEXT,
  "Documento" TEXT,
  "Banco" TEXT
);

CREATE TABLE IF NOT EXISTS "Apartado Auxiliar" (
  "Numero_apartado" INTEGER,
  "Fecha_apartado" TEXT,
  "Tipo_apartado" TEXT,
  "Monto_apartado" REAL,
  "Descuento" REAL,
  "ITBIS" REAL,
  "Vencimiento" TEXT,
  "Codigo_cuenta" TEXT,
  "Vendedor" TEXT,
  "Asiento_numero" INTEGER,
  "Apartar_con" REAL,
  "Turno" INTEGER,
  "Abierto" INTEGER
);

CREATE TABLE IF NOT EXISTS "Apartados" (
  "Numero_apartado" INTEGER,
  "Fecha_apartado" TEXT,
  "Tipo_apartado" TEXT,
  "Monto_apartado" REAL,
  "Descuento" REAL,
  "ITBIS" REAL,
  "Vencimiento" TEXT,
  "Codigo_cuenta" TEXT,
  "Vendedor" TEXT,
  "Asiento_numero" INTEGER,
  "Apartar_con" REAL,
  "Turno" INTEGER,
  "Abierto" INTEGER,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Asientos Documentos" (
  "Asiento_numero" INTEGER,
  "Fecha_asiento" TEXT,
  "Cuenta_asiento" TEXT,
  "Descripcion" TEXT,
  "Debito" REAL,
  "Credito" REAL,
  "Debito_anterior" REAL,
  "Credito_anterior" REAL,
  "Documento" TEXT,
  "Beneficiario" TEXT
);

CREATE TABLE IF NOT EXISTS "AutoFacturas" (
  "Codigo_cuenta" TEXT,
  "Monto_factura" REAL,
  "Descuento" REAL,
  "ITBIS" REAL,
  "Facturar_dia" INTEGER,
  "Facturar_desde" TEXT,
  "Facturar_hasta" TEXT,
  "Concepto" TEXT,
  "Facturar_ilimitado" INTEGER,
  "Facturar_anual" INTEGER,
  "Mes_facturar" INTEGER,
  "Cantidad_facturar" INTEGER,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Balances Bancos" (
  "Numero_cuenta" TEXT,
  "Mes" INTEGER,
  "Ano" INTEGER,
  "Balance" REAL
);

CREATE TABLE IF NOT EXISTS "Balances Iniciales" (
  "Numero_cuenta" TEXT,
  "Balance" REAL
);

CREATE TABLE IF NOT EXISTS "Balanza" (
  "Numero" TEXT,
  "Debito_anterior" REAL,
  "Credito_anterior" REAL,
  "Debito_periodo" REAL,
  "Credito_periodo" REAL,
  "Debito_actual" REAL,
  "Credito_actual" REAL
);

CREATE TABLE IF NOT EXISTS "Calendario del mes de ahorros" (
  "Mes" TEXT,
  "Semana_desde" INTEGER,
  "Semana_hasta" INTEGER,
  "Fecha_Hasta" TEXT
);

CREATE TABLE IF NOT EXISTS "Calendario Formulario IR-4" (
  "Mes" TEXT,
  "Semana_desde" INTEGER,
  "Semana_hasta" INTEGER
);

CREATE TABLE IF NOT EXISTS "Categorias" (
  "Categoria" TEXT,
  "fila" INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "Categorias Clientes" (
  "Categoria" TEXT
);

CREATE TABLE IF NOT EXISTS "cheques en Compras" (
  "Codigobanco" TEXT,
  "Numerocuenta" TEXT,
  "Nombrebanco" TEXT,
  "NumeroCheque" INTEGER,
  "Monto" REAL,
  "Pagado_a" TEXT,
  "Concepto" TEXT,
  "Fecha_cheque" TEXT,
  "Factura_pagada" INTEGER,
  "Pago_suplidor" TEXT,
  "Comentarios" TEXT
);

CREATE TABLE IF NOT EXISTS "cheques en Compras Auxiliar" (
  "Codigobanco" TEXT,
  "Numerocuenta" TEXT,
  "Nombrebanco" TEXT,
  "NumeroCheque" INTEGER,
  "Monto" REAL,
  "Pagado_a" TEXT,
  "Concepto" TEXT,
  "Fecha_cheque" TEXT,
  "Factura_pagada" INTEGER,
  "Pago_suplidor" TEXT,
  "Comentarios" TEXT
);

CREATE TABLE IF NOT EXISTS "Cheques en Transito" (
  "Cuenta_banco" TEXT,
  "Fecha" TEXT,
  "Numero_cheque" INTEGER,
  "Beneficiario" TEXT,
  "Importe" REAL
);

CREATE TABLE IF NOT EXISTS "Cheques Recibidos" (
  "Numero_cheque" TEXT,
  "Fecha_cheque" TEXT,
  "Monto" REAL,
  "Banco" TEXT,
  "Emisor" TEXT,
  "Concepto" TEXT,
  "Factura_pagada" INTEGER,
  "Vendido_Cuenta" TEXT
);

CREATE TABLE IF NOT EXISTS "Cheques Recibidos Auxiliar" (
  "Numero_cheque" TEXT,
  "Fecha_cheque" TEXT,
  "Monto" REAL,
  "Banco" TEXT,
  "Emisor" TEXT,
  "Concepto" TEXT,
  "Factura_pagada" INTEGER,
  "Vendido_Cuenta" TEXT
);

CREATE TABLE IF NOT EXISTS "Conceptos de Retiros" (
  "id" INTEGER PRIMARY KEY,
  "Concepto" TEXT,
  "Numero_cuenta" TEXT
);

CREATE TABLE IF NOT EXISTS "Cooperativa Acumulada" (
  "Numero_empleado" INTEGER,
  "Cooperativa_acumulada" REAL
);

CREATE TABLE IF NOT EXISTS "Cotizaciones" (
  "Numero_cotizacion" INTEGER NOT NULL,
  "Fecha_cotizacion" TEXT,
  "Cliente" TEXT,
  "Monto_cotizacion" REAL,
  "Descuento" REAL,
  "ITBIS" REAL,
  "Codigo_cliente" TEXT,
  "Vendedor" TEXT,
  "RNC" TEXT,
  "id_almacen" INTEGER,
  "Procesada" TEXT,
  "Tipo" TEXT,
  "Recargo" REAL
);

CREATE TABLE IF NOT EXISTS "Creditos de Comprados a Contado" (
  "Nombre" TEXT NOT NULL,
  "Direccion" TEXT,
  "Total_creditos" REAL
);

CREATE TABLE IF NOT EXISTS "Creditos de Comprados a Contado Auxiliar" (
  "Nombre" TEXT NOT NULL,
  "Direccion" TEXT,
  "Total_creditos" REAL
);

CREATE TABLE IF NOT EXISTS "Cuadres" (
  "Numero_turno" INTEGER,
  "De_factura" INTEGER,
  "A_Factura" INTEGER
);

CREATE TABLE IF NOT EXISTS "Cuadres Multiples" (
  "Vendedor" TEXT,
  "Fecha" TEXT,
  "A_Factura" INTEGER,
  "Fecha_factura" TEXT
);

CREATE TABLE IF NOT EXISTS "Cuadres Multiples Auxiliar" (
  "Vendedor" TEXT,
  "Fecha" TEXT,
  "A_Factura" INTEGER,
  "Fecha_factura" TEXT
);

CREATE TABLE IF NOT EXISTS "Cuentas Bancarias" (
  "Cuenta_banco" TEXT,
  "Nombre_banco" TEXT,
  "Numero_cuenta" TEXT,
  "Balance" REAL,
  "Cuenta_dolares" INTEGER,
  "Cuenta_euros" INTEGER,
  "Cuenta_prima" TEXT,
  "Numero_cuenta_reserva" TEXT,
  "Secuencia" INTEGER
);

CREATE TABLE IF NOT EXISTS "Datos Empresa" (
  "Nombre_empresa" TEXT,
  "Comentario" TEXT,
  "Direccion" TEXT,
  "Ciudad" TEXT,
  "Telefono1" TEXT,
  "Telefono2" TEXT,
  "Fax" TEXT,
  "RNC" TEXT,
  "Eslogan" TEXT,
  "Comentario1" TEXT,
  "Comentario2" TEXT,
  "Comentario3" TEXT,
  "Iconos" INTEGER,
  "Posicion" TEXT,
  "Siempre_ITBIS" INTEGER,
  "Solo_credito" INTEGER,
  "Mostrar_facturacion" INTEGER,
  "Imagen" TEXT,
  "ITBIS" REAL,
  "TipoFactura" TEXT,
  "PuertoModem" INTEGER,
  "Mostrar_costo" INTEGER,
  "Usa_cashDrawer" INTEGER,
  "Pedir_clave" INTEGER,
  "clave_abrir" INTEGER,
  "Cajero_caja" INTEGER,
  "Cajero_anular" INTEGER,
  "Tipo_label" INTEGER,
  "Margen_izquierdo" REAL,
  "Letra1" TEXT,
  "Letra2" TEXT,
  "Letra3" TEXT,
  "Letra4" TEXT,
  "Letra5" TEXT,
  "Letra6" TEXT,
  "Letra7" TEXT,
  "Letra8" TEXT,
  "Letra9" TEXT,
  "Letra10" TEXT,
  "TipoCotizacion" TEXT,
  "Poner_observaciones" INTEGER,
  "ITBIS_manual" INTEGER,
  "Facturar_soloProducto" INTEGER,
  "Utilizar_ITBIS" INTEGER,
  "Manejar_3" INTEGER,
  "MargenB" REAL,
  "MargenC" REAL,
  "ITBIS_Descuento" INTEGER,
  "NoITBIS_Contado" INTEGER,
  "Imprimir_precio" INTEGER,
  "Printer_usar" TEXT,
  "Facturar_masuna" INTEGER,
  "Mes_email" INTEGER,
  "Cobrar_email" INTEGER,
  "Nombre_impuesto" TEXT,
  "Facturar_MAsVentanas" INTEGER,
  "ITBIS_SiempreActivo" INTEGER,
  "Debe_UsarVendedores" INTEGER,
  "Porcentual" INTEGER,
  "Ancla_F12" INTEGER,
  "Reg_patronal" TEXT,
  "Representante" TEXT,
  "Clase_empresa" TEXT,
  "Rama_actividad" TEXT,
  "Capital_social" REAL,
  "Horario" TEXT,
  "Vacaciones_inicia" TEXT,
  "Vacaciones_termina" TEXT,
  "Exencion" INTEGER,
  "Limite1" INTEGER,
  "Limite2" INTEGER,
  "Anexo1" INTEGER,
  "Anexo2" INTEGER,
  "Preparado" TEXT,
  "Agencia_local" TEXT,
  "Numero_poliza" INTEGER,
  "Tipo_nomina" TEXT,
  "Tipo_pago" TEXT,
  "Numero_testigo" INTEGER,
  "Nombre_gerente" TEXT,
  "Banco" TEXT,
  "Dedicada" TEXT,
  "AFP_Empleados" REAL,
  "AFP_Empresa" REAL,
  "Tope_AFP" REAL,
  "Porciento_IDSS" REAL,
  "Tope_Seguro" REAL,
  "Retroactivo" INTEGER,
  "Codigo_nomina" INTEGER,
  "Cuenta_debitar" TEXT,
  "Cuenta_leon" INTEGER,
  "Limite3" INTEGER,
  "Anexo3" INTEGER,
  "Carta_atencion" TEXT,
  "Gerente_general" TEXT,
  "Vacaciones_colectivas" INTEGER,
  "Nombre_administrador" TEXT,
  "ARS_Empleados" REAL,
  "ARS_Empresa" REAL,
  "Tope_ARS" REAL,
  "Usar_codigoBarraUnico" INTEGER,
  "Fondos_caja" REAL,
  "Etiqueta_joyeria" INTEGER,
  "Contrato_clientes" INTEGER,
  "Usar_ArchivoNCF" INTEGER,
  "Ruta_NCF" TEXT,
  "No_detallarCotizados" INTEGER,
  "PedirCantidadPuntoV" INTEGER,
  "SoloActivosCxC" INTEGER,
  "Mes_Autofacturacion" INTEGER,
  "Retenciones_alMes" INTEGER,
  "Ano_autofacturacion" INTEGER,
  "CadaCuantoLadoRojo" INTEGER,
  "ContadorLadoAzul" INTEGER,
  "ContadorRojo" INTEGER,
  "CantidadRojo" INTEGER,
  "MostrarArticulos" INTEGER,
  "Empezar_Turno1" INTEGER,
  "NoImprimirCreditoPuntoV" INTEGER,
  "NoFacturarArticulosSinExistencia" INTEGER,
  "PedirAutorizacionConFacturasVencidas" INTEGER,
  "NoModificarFacturas" INTEGER,
  "PorMayorPorDefecto" INTEGER,
  "NoVenderPostador" INTEGER,
  "Linea_puntoVenta" INTEGER,
  "Guardar_bitacora" INTEGER,
  "NoUsarTurnosEnCuadre" INTEGER,
  "Por_cada" REAL,
  "Cantidad_puntos" INTEGER,
  "Facturar_sinExistencia" INTEGER,
  "TipoNomina" TEXT,
  "Dias_gracia" INTEGER,
  "Dias_gracia_mora" INTEGER,
  "Porciento_mora" REAL,
  "Descuento_maximo" INTEGER,
  "Porciento_financiamiento" REAL,
  "Mora_facturas" REAL,
  "UsarMultiplesCajeros" INTEGER,
  "NoDetallarCuadre" INTEGER,
  "AutorizacionDevoluciones" INTEGER,
  "Decimales" INTEGER,
  "Maximo_descuento" INTEGER,
  "Prestamo1" TEXT,
  "Prestamo2" TEXT,
  "Prestamo3" TEXT,
  "Prestamo4" TEXT,
  "Prestamo5" TEXT,
  "CambiarPrecioEntrada" INTEGER,
  "ModificarSecuenciaCheque" INTEGER,
  "Codigo_NominaBPD" TEXT,
  "NumeroCopias" INTEGER
);

CREATE TABLE IF NOT EXISTS "Departamentos" (
  "Numero" INTEGER NOT NULL,
  "Departamento" TEXT,
  "Tipo_departamento" TEXT,
  "Hora_entrada" TEXT,
  "Hora_salida" TEXT,
  "Supervisor" TEXT,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Depositos bancarios" (
  "codigo_banco" TEXT,
  "Nombre_banco" TEXT,
  "Numero_cuenta" INTEGER,
  "Fecha_deposito" TEXT,
  "Sucursal" TEXT,
  "Cajero" INTEGER,
  "Cantidad" REAL,
  "Observaciones" TEXT,
  "Clasificacion" TEXT
);

CREATE TABLE IF NOT EXISTS "Descuentos" (
  "Fecha_descuento" TEXT,
  "Numero_factura" INTEGER,
  "Codigo_cuenta" TEXT,
  "Monto_descuento" REAL
);

CREATE TABLE IF NOT EXISTS "Descuentos Auxiliar" (
  "Fecha_descuento" TEXT,
  "Numero_factura" INTEGER,
  "Codigo_cuenta" TEXT,
  "Monto_descuento" REAL
);

CREATE TABLE IF NOT EXISTS "Descuentos en Compras" (
  "Codigo_suplidor" TEXT,
  "Numero_factura" REAL,
  "Monto" REAL,
  "Razon" TEXT,
  "Fecha_descuento" TEXT
);

CREATE TABLE IF NOT EXISTS "Descuentos en Compras Auxiliar" (
  "Codigo_suplidor" TEXT,
  "Numero_factura" INTEGER,
  "Monto" REAL,
  "Razon" TEXT,
  "Fecha_descuento" TEXT
);

CREATE TABLE IF NOT EXISTS "Detalles de Abonos Auxiliar" (
  "Numero_recibo" INTEGER,
  "Numero_factura" INTEGER,
  "Monto_abono" REAL,
  "Concepto" TEXT
);

CREATE TABLE IF NOT EXISTS "Dias Feriados" (
  "Dia_feriado" INTEGER,
  "Mes_feriado" INTEGER,
  "Razon" TEXT
);

CREATE TABLE IF NOT EXISTS "Electrodomestico" (
  "Numero_empleado" INTEGER,
  "Electrodomestico" REAL,
  "Fecha_electrodomestico" TEXT,
  "Pagos_electrodomestico" INTEGER,
  "BalanceElectrodomestico" REAL,
  "Deduccion_electrodomestico" REAL,
  "Activado" INTEGER,
  "Secuencia" INTEGER,
  "Asiento_numero" INTEGER
);

CREATE TABLE IF NOT EXISTS "Electrodomestico Acumulado" (
  "Numero_empleado" INTEGER,
  "Acumulado" REAL
);

CREATE TABLE IF NOT EXISTS "Emergencia" (
  "Numero_empleado" INTEGER,
  "Emergencia" REAL,
  "Fecha_emergencia" TEXT,
  "Pagos_emergencia" INTEGER,
  "BalanceEmergencia" REAL,
  "Deduccion_emergencia" REAL,
  "Activado" INTEGER,
  "Secuencia" INTEGER,
  "Asiento_numero" INTEGER
);

CREATE TABLE IF NOT EXISTS "Emergencia Acumulada" (
  "Numero_empleado" INTEGER,
  "Acumulado" REAL
);

CREATE TABLE IF NOT EXISTS "Empleados Fijos" (
  "Numero" INTEGER
);

CREATE TABLE IF NOT EXISTS "Estado de Cuenta1" (
  "Nombre_cuenta" TEXT,
  "Codigo_cuenta" TEXT,
  "Detalle" TEXT,
  "Fecha" TEXT,
  "Cargo" REAL,
  "Abono" REAL,
  "Balance" REAL,
  "Documento" TEXT,
  "Usuario" TEXT
);

CREATE TABLE IF NOT EXISTS "Existencia_almacen" (
  "fila" INTEGER PRIMARY KEY,
  "id_almacen" INTEGER,
  "codigo_articulo" TEXT,
  "existencia" REAL,
  "inicial" REAL,
  "entrada" REAL,
  "salida" REAL,
  "existencia_fisica" REAL,
  "Nombre_usuario" TEXT,
  "Unidad" TEXT
);

CREATE TABLE IF NOT EXISTS "Facturas Memo" (
  "Numero_factura" INTEGER NOT NULL,
  "Tipo_factura" TEXT,
  "Fecha_factura" TEXT,
  "Vendido_cuenta" TEXT,
  "Direccion_cuenta" TEXT,
  "Monto_factura" REAL,
  "Vencimiento" TEXT,
  "Pagada" TEXT,
  "Descuento" REAL,
  "ITBIS" REAL,
  "Codigo_cuenta" TEXT,
  "Vendedor" TEXT,
  "Mes" INTEGER,
  "Asiento_numero" INTEGER,
  "NCF" TEXT,
  "Tipo_NCF" TEXT,
  "PC" TEXT,
  "Turno" INTEGER,
  "RNC" TEXT,
  "Secuencia" INTEGER,
  "Modo_pago" TEXT,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Farmacia" (
  "Numero_empleado" INTEGER,
  "Farmacia" REAL,
  "Fecha_farmacia" TEXT,
  "Pagos_farmacia" INTEGER,
  "BalanceFarmacia" REAL,
  "Deduccion_farmacia" REAL,
  "Activado" INTEGER,
  "Secuencia" INTEGER,
  "Asiento_numero" INTEGER
);

CREATE TABLE IF NOT EXISTS "Farmacia Acumulada" (
  "Numero_empleado" INTEGER,
  "Acumulado" REAL
);

CREATE TABLE IF NOT EXISTS "Financiamiento Temporal" (
  "Numero_pagare" INTEGER,
  "Codigo_cliente" TEXT,
  "Concepto" TEXT,
  "Interes" REAL,
  "Monto_prestamo" REAL,
  "Fecha_prestamo" TEXT,
  "Fecha_inicio" TEXT,
  "Cant_pagos" INTEGER,
  "Finalizado" INTEGER,
  "Agente" TEXT,
  "Congelado" INTEGER,
  "Numero_factura" INTEGER,
  "Modo_pago" TEXT,
  "Tipo_saldo" TEXT,
  "Tipo_prestamo" TEXT,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Formulario606" (
  "Secuencia" INTEGER,
  "Codigo_suplidor" TEXT,
  "Numero_factura" REAL,
  "Credito" INTEGER,
  "Contado" INTEGER,
  "Monto" REAL,
  "Fecha_factura" TEXT,
  "Fecha_llegada" TEXT,
  "Vencimiento" TEXT,
  "Pagada" TEXT,
  "Tipo_factura" TEXT,
  "Mercancias" INTEGER,
  "Gastos" INTEGER,
  "Procesada" TEXT,
  "ITBIS" REAL,
  "Flete" REAL,
  "Descuento" REAL,
  "Monto_neto" REAL,
  "Orden_compra" INTEGER,
  "Asiento_numero" INTEGER,
  "NCF" TEXT,
  "Usuario" TEXT,
  "Numero_cuenta" TEXT,
  "Numero_cheque" TEXT,
  "Cuenta_debitar" TEXT,
  "Concepto" TEXT,
  "Cheque" INTEGER,
  "id_almacen" INTEGER,
  "Retenido_2" REAL,
  "Retenido_10" REAL,
  "ITBIS_retenido" REAL,
  "RNC" TEXT,
  "CodigoID" INTEGER
);

CREATE TABLE IF NOT EXISTS "Formulario607" (
  "Numero_factura" INTEGER NOT NULL,
  "Tipo_factura" TEXT,
  "Fecha_factura" TEXT,
  "Vendido_cuenta" TEXT,
  "Direccion_cuenta" TEXT,
  "Monto_factura" REAL,
  "Vencimiento" TEXT,
  "Pagada" TEXT,
  "Descuento" REAL,
  "ITBIS" REAL,
  "Codigo_cuenta" TEXT,
  "Vendedor" TEXT,
  "Mes" INTEGER,
  "Asiento_numero" INTEGER,
  "NCF" TEXT,
  "Tipo_NCF" TEXT,
  "PC" TEXT,
  "Turno" INTEGER,
  "RNC" TEXT,
  "Secuencia" INTEGER,
  "Modo_pago" TEXT,
  "id_almacen" INTEGER,
  "Ship_to" TEXT,
  "Orden_numero" INTEGER,
  "Gravado" REAL,
  "Parte_efectivo" REAL,
  "ITBIS_diferido" REAL,
  "CodigoId" INTEGER,
  "NCF_Modificado" TEXT
);

CREATE TABLE IF NOT EXISTS "Formulario608" (
  "Numero_factura" INTEGER NOT NULL,
  "Tipo_factura" TEXT,
  "Fecha_factura" TEXT,
  "Vendido_cuenta" TEXT,
  "Direccion_cuenta" TEXT,
  "Monto_factura" REAL,
  "Vencimiento" TEXT,
  "Pagada" TEXT,
  "Descuento" REAL,
  "ITBIS" REAL,
  "Codigo_cuenta" TEXT,
  "Vendedor" TEXT,
  "Mes" INTEGER,
  "Asiento_numero" INTEGER,
  "NCF" TEXT,
  "Tipo_NCF" TEXT,
  "PC" TEXT,
  "Turno" INTEGER,
  "RNC" TEXT,
  "Secuencia" INTEGER,
  "Modo_pago" TEXT,
  "id_almacen" INTEGER,
  "Ship_to" TEXT,
  "Orden_numero" INTEGER,
  "Gravado" REAL,
  "Parte_efectivo" REAL,
  "ITBIS_diferido" REAL,
  "CodigoId" INTEGER
);

CREATE TABLE IF NOT EXISTS "Gastos Menores" (
  "Fecha_gasto" TEXT,
  "Monto_gasto" REAL,
  "Concepto" TEXT,
  "NCF" TEXT,
  "Impreso" INTEGER,
  "Beneficiario" TEXT,
  "Tipo_gasto" TEXT,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Gastos Pagados por Adelantado" (
  "Descripcion" TEXT,
  "Monto" REAL,
  "Desde" TEXT,
  "Hasta" TEXT,
  "Balance" REAL,
  "Cuotas" REAL,
  "Cuenta_debitar" TEXT,
  "Cuenta_creditar" TEXT
);

CREATE TABLE IF NOT EXISTS "Gerentes de Zona" (
  "Codigo_gerente" INTEGER PRIMARY KEY,
  "Nombre_gerente" TEXT NOT NULL,
  "Apellidos_gerente" TEXT NOT NULL,
  "Direccion_gerente" TEXT,
  "Ciudad_gerente" TEXT,
  "Telefono_gerente" TEXT,
  "Foto" TEXT,
  "Telefono2" TEXT,
  "Clave" TEXT
);

CREATE TABLE IF NOT EXISTS "Historial" (
  "Numero_empleado" INTEGER,
  "Horas_normales" REAL,
  "Horas_extras" REAL,
  "Horas_dobles" REAL,
  "Horas_feriado" REAL,
  "Incentivo" REAL,
  "Fecha" TEXT,
  "Numero_cheque" TEXT,
  "Semana_numero" INTEGER,
  "Salario_semanal" REAL,
  "Prestamo" REAL,
  "Isr" REAL,
  "Cooperativa" REAL,
  "Emergencia" REAL,
  "Electrodomestico" REAL,
  "Farmacia" REAL,
  "Aporte" REAL,
  "Otras_deducciones" REAL,
  "Seguro_social" REAL,
  "Otros_ingresos" REAL,
  "AFP" REAL,
  "Seguro_privado" REAL,
  "Dias_vacaciones" INTEGER,
  "ISR_Vacaciones" REAL,
  "Asiento_numero" INTEGER,
  "Comentario_OtrasDed" TEXT,
  "Comentario_OtrosIngr" TEXT,
  "Fecha_hasta" TEXT,
  "temporal" TEXT,
  "Ano" INTEGER
);

CREATE TABLE IF NOT EXISTS "Historial Control Productos Entrados" (
  "fila" INTEGER NOT NULL,
  "Numero_compra" REAL,
  "Fecha_compra" TEXT,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Unidad" TEXT,
  "Costo_producto" REAL,
  "Codigo_suplidor" TEXT,
  "Marca" TEXT,
  "Local" TEXT,
  "Codigo_barra" TEXT,
  "Estatus" TEXT,
  "Estatus_fisico" TEXT,
  "id_almacen" INTEGER,
  "Margen" REAL,
  "Paga_ITBIS" INTEGER,
  "Descuento_antes" REAL,
  "Descuento_despues" REAL
);

CREATE TABLE IF NOT EXISTS "Historial de Ponches" (
  "Numero_empleado" INTEGER,
  "Hora" TEXT,
  "Fecha" TEXT,
  "Concepto" TEXT
);

CREATE TABLE IF NOT EXISTS "Historial Productos_facturados" (
  "Numero_factura" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Cantidad_cred" REAL,
  "Fecha_factura" TEXT,
  "Unidad" TEXT,
  "Cod_barra" TEXT,
  "Factura_compra" INTEGER,
  "Fecha_compra" TEXT,
  "Cod_suplidor" TEXT,
  "Precio_compra" REAL,
  "Fecha_entrada" TEXT,
  "Hora_entrada" TEXT,
  "Fecha_vencimiento" TEXT,
  "Numero_serie" TEXT,
  "ITBIS" REAL,
  "Descuento" REAL,
  "Marca" TEXT,
  "Ano_vencimiento" INTEGER,
  "Mes_vencimiento" INTEGER,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Historial Productos_facturados Auxiliar" (
  "Numero_factura" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Cantidad_cred" REAL,
  "Fecha_factura" TEXT,
  "Unidad" TEXT,
  "Cod_barra" TEXT,
  "Factura_compra" INTEGER,
  "Fecha_compra" TEXT,
  "Cod_suplidor" INTEGER,
  "Precio_compra" REAL,
  "Fecha_entrada" TEXT,
  "Hora_entrada" TEXT,
  "Fecha_vencimiento" TEXT,
  "Numero_serie" TEXT,
  "ITBIS" REAL,
  "Descuento" REAL,
  "Marca" TEXT,
  "Codigo_cuenta" TEXT,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Historial Productos_SalidaAlmacen" (
  "Numero_conduce" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Cantidad_cred" REAL,
  "Fecha_factura" TEXT,
  "Unidad" TEXT,
  "Cod_barra" TEXT,
  "Factura_compra" INTEGER,
  "Fecha_compra" TEXT,
  "Cod_suplidor" INTEGER,
  "Precio_compra" REAL,
  "Fecha_entrada" TEXT,
  "Hora_entrada" TEXT,
  "Fecha_vencimiento" TEXT,
  "Numero_serie" TEXT,
  "ITBIS" REAL,
  "Descuento" REAL,
  "Marca" TEXT,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Interfaz Contabilidad" (
  "Cuenta_efectivo" TEXT,
  "Cuenta_ingreso" TEXT,
  "Cuenta_CxC" TEXT,
  "Cuenta_Descuento_ventas" TEXT,
  "Cuenta_ITBIS" TEXT,
  "Cuenta_CxP" TEXT,
  "Cuenta_Compra" TEXT,
  "Cuenta_descuento_compras" TEXT,
  "Cuenta_devolucionVentas" TEXT,
  "Cuenta_devolucionCompras" TEXT,
  "Cuenta_ITBISCompra" TEXT,
  "Cuenta_VentaCash" TEXT,
  "Cuenta_VentaCheque" TEXT,
  "Cuenta_CompraCash" TEXT,
  "Cuenta_CompraCheque" TEXT,
  "Cuenta_costo" TEXT,
  "Cuenta_depreciacion" TEXT,
  "Cuenta_ActivosFijos" TEXT,
  "Cuenta_gastos" TEXT,
  "Cuenta_gastosMenores" TEXT,
  "Cuenta_cargos" TEXT,
  "Cuenta_ganancias" TEXT,
  "Cuenta_SueldoNormal" TEXT,
  "Cuenta_SueldoExtra" TEXT,
  "Cuenta_SueldoFeriado" TEXT,
  "Cuenta_Bonos" TEXT,
  "Cuenta_Vacaciones" TEXT,
  "Cuenta_Prestamos" TEXT,
  "Cuenta_ISR" TEXT,
  "Cuenta_Seguros" TEXT,
  "Cuenta_OtrasDeducciones" TEXT,
  "Cuenta_AFP" TEXT,
  "Cuenta_Liquidacion" TEXT,
  "Cuenta_Regalia" TEXT,
  "Cuenta_infotep" TEXT,
  "Cuenta_OtrosSeguros" TEXT,
  "Cuenta_RetirosCaja" TEXT,
  "Cuenta_anticipos" TEXT,
  "Cuenta_nomina" TEXT,
  "Cuenta_depreciacionB" TEXT,
  "Cuenta_depreciacionC" TEXT,
  "Cuenta_SueldoNormalIndirectos" TEXT,
  "Cuenta_InteresFinanciar" TEXT,
  "Cuenta_ResultadoGoP" TEXT,
  "Cuenta_DocXCobrar" TEXT,
  "Cuenta_PagochequesFuturistas" TEXT
);

CREATE TABLE IF NOT EXISTS "Inventario_fisico" (
  "fila" INTEGER PRIMARY KEY,
  "id_almacen" INTEGER,
  "codigo_articulo" TEXT,
  "existencia" REAL,
  "inicial" REAL,
  "entrada" REAL,
  "salida" REAL,
  "existencia_fisica" REAL,
  "Nombre_usuario" TEXT,
  "Unidad" TEXT
);

CREATE TABLE IF NOT EXISTS "Jornada" (
  "Numero_empleado" INTEGER,
  "Hora" TEXT,
  "Fecha" TEXT
);

CREATE TABLE IF NOT EXISTS "Libro de Banco" (
  "Fecha" TEXT,
  "referencia" TEXT,
  "Detalles" TEXT,
  "Debito" REAL,
  "Credito" REAL,
  "Balance" REAL
);

CREATE TABLE IF NOT EXISTS "Logo" (
  "Logo" TEXT,
  "LogoFacturas" TEXT,
  "Logo_mostrar" TEXT
);

CREATE TABLE IF NOT EXISTS "Meses" (
  "Numero" INTEGER NOT NULL,
  "Mes" TEXT
);

CREATE TABLE IF NOT EXISTS "Movimientos" (
  "fila" INTEGER PRIMARY KEY,
  "Cuenta_banco" TEXT,
  "Fecha" TEXT,
  "Cantidad" REAL,
  "Numero_documento" TEXT,
  "Concepto" TEXT,
  "Chequeado" INTEGER,
  "Numero_asiento" INTEGER
);

CREATE TABLE IF NOT EXISTS "NCF" (
  "id_almacen" INTEGER,
  "NCF_facturasMayor_desde" TEXT,
  "NCF_facturasMayor_hasta" TEXT,
  "NCF_facturas_desde" TEXT,
  "NCF_facturas_hasta" TEXT,
  "NCF_NotasDebito_desde" TEXT,
  "NCF_NotasDebito_hasta" TEXT,
  "NCF_NotasCredito_desde" TEXT,
  "NCF_NotasCredito_hasta" TEXT,
  "NCF_Gastos_desde" TEXT,
  "NCF_Gastos_hasta" TEXT,
  "NCF_Informal_desde" TEXT,
  "NCF_Informal_hasta" TEXT,
  "NCF_Especial_desde" TEXT,
  "NCF_Especial_hasta" TEXT,
  "NCF_Gobierno_desde" TEXT,
  "NCF_Gobierno_hasta" TEXT
);

CREATE TABLE IF NOT EXISTS "NCF2" (
  "id_almacen" INTEGER,
  "pc" TEXT,
  "orden_pc" INTEGER,
  "NCF_facturasvalorf_hasta" TEXT,
  "NCF_facturasvalorf_desde" TEXT,
  "NCF_facturasfinal_desde" TEXT,
  "NCF_facturasfinal_hasta" TEXT,
  "NCF_NotasCreditofinal_desde" TEXT,
  "NCF_NotasCreditofinal_hasta" TEXT,
  "NCF_NotasCreditovalorf_desde" TEXT,
  "NCF_NotasCreditovalorf_hasta" TEXT,
  "NCF_facturasfinalExonera_desde" TEXT,
  "NCF_facturasfinalExonera_hasta" TEXT,
  "NCF_facturasvalorfExonera_desde" TEXT,
  "NCF_facturasvalorfExonera_hasta" TEXT,
  "NCF_NotasCreditofinalExonera_desde" TEXT,
  "NCF_NotasCreditofinalExonera_hasta" TEXT,
  "NCF_NotasCreditovalorfExonera_desde" TEXT,
  "NCF_NotasCreditovalorfExonera_hasta" TEXT,
  "NCF_Gobierno_desde" TEXT,
  "NCF_Gobierno_hasta" TEXT
);

CREATE TABLE IF NOT EXISTS "NumConduce" (
  "Numero_conduce" INTEGER
);

CREATE TABLE IF NOT EXISTS "NumFact" (
  "UltimaFacturaAzul" INTEGER,
  "UltimaFacturaRoja" INTEGER,
  "UltimoConduce" INTEGER,
  "id_almacen" INTEGER,
  "pc" TEXT,
  "orden_pc" INTEGER
);

CREATE TABLE IF NOT EXISTS "NumRec" (
  "Numero_recibo" INTEGER,
  "Numero_recibo_rojo" INTEGER
);

CREATE TABLE IF NOT EXISTS "Observaciones Cotizacion" (
  "Numero_cotizacion" INTEGER,
  "Observacion" TEXT
);

CREATE TABLE IF NOT EXISTS "Observaciones Facturas" (
  "Numero_factura" INTEGER,
  "Observacion" TEXT
);

CREATE TABLE IF NOT EXISTS "Observaciones Facturas Auxiliar" (
  "Numero_factura" INTEGER,
  "Observacion" TEXT
);

CREATE TABLE IF NOT EXISTS "Ocupaciones" (
  "id" INTEGER PRIMARY KEY,
  "Ocupacion" TEXT
);

CREATE TABLE IF NOT EXISTS "Orden de Compra" (
  "Numero_orden" INTEGER NOT NULL,
  "Fecha_orden" TEXT,
  "Codigo_suplidor" TEXT
);

CREATE TABLE IF NOT EXISTS "Ordenes de Compra" (
  "Numero_orden" INTEGER NOT NULL,
  "Tipo_orden" TEXT,
  "Fecha_orden" TEXT,
  "Vendido_cuenta" TEXT,
  "Direccion_cuenta" TEXT,
  "Monto_orden" REAL,
  "Vencimiento" TEXT,
  "Descuento" REAL,
  "ITBIS" REAL,
  "Codigo_cuenta" TEXT,
  "Vendedor" TEXT,
  "Mes" INTEGER,
  "Asiento_numero" INTEGER,
  "PC" TEXT,
  "Turno" INTEGER,
  "RNC" TEXT,
  "Modo_pago" TEXT,
  "id_almacen" INTEGER,
  "Procesada" TEXT
);

CREATE TABLE IF NOT EXISTS "Pagare Temporal" (
  "Numero_pagare" INTEGER,
  "Codigo_cliente" TEXT,
  "Pagada" INTEGER,
  "Fecha_pago" TEXT,
  "Vencida" INTEGER,
  "Fecha_pagare" TEXT,
  "Balance_capital" REAL,
  "Balance_interes" REAL,
  "Capital_acumulado" REAL,
  "Interes_acumulado" REAL,
  "Pagos_acumulados" REAL,
  "Numero_cuota" INTEGER,
  "Interes" REAL,
  "Capital" REAL,
  "Interes_por_dia" REAL,
  "Congelado" INTEGER,
  "Numero_factura" INTEGER,
  "Tipo_prestamo" TEXT,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Pago de Prestamos" (
  "Numero_prestamo" TEXT,
  "Monto_pago" REAL,
  "Fecha_pago" TEXT,
  "Cuenta_debitar" TEXT,
  "Asiento_numero" INTEGER,
  "Pago_interes" REAL
);

CREATE TABLE IF NOT EXISTS "Pagos con Tarjetas de Credito" (
  "Numero_tarjeta" TEXT,
  "Tipo_tarjeta" TEXT,
  "Banco" TEXT,
  "Portador" TEXT,
  "Fecha_pago" TEXT,
  "Concepto" TEXT,
  "Factura_pagada" INTEGER,
  "Vendido_Cuenta" TEXT,
  "Monto" REAL
);

CREATE TABLE IF NOT EXISTS "Pagos con Tarjetas de Credito Auxiliar" (
  "Numero_tarjeta" TEXT,
  "Tipo_tarjeta" TEXT,
  "Banco" TEXT,
  "Portador" TEXT,
  "Fecha_pago" TEXT,
  "Concepto" TEXT,
  "Factura_pagada" INTEGER,
  "Vendido_Cuenta" TEXT,
  "Monto" REAL
);

CREATE TABLE IF NOT EXISTS "Pagos Hechos con Tarjeta Credito" (
  "Numero_tarjeta" TEXT,
  "Monto" REAL,
  "Banco" TEXT,
  "Fecha_pago" TEXT,
  "Tipo_tarjeta" TEXT,
  "Concepto" TEXT,
  "Factura_pagada" REAL,
  "Codigo_Suplidor" TEXT
);

CREATE TABLE IF NOT EXISTS "Pagos Hechos con Tarjeta Credito Auxiliar" (
  "Numero_tarjeta" TEXT,
  "Monto" REAL,
  "Banco" TEXT,
  "Fecha_pago" TEXT,
  "Tipo_tarjeta" TEXT,
  "Concepto" TEXT,
  "Factura_pagada" INTEGER,
  "Codigo_Suplidor" TEXT
);

CREATE TABLE IF NOT EXISTS "Pedidos de Comida" (
  "Numero_empleado" INTEGER,
  "Fecha" TEXT,
  "Precio" REAL,
  "Tipo" TEXT
);

CREATE TABLE IF NOT EXISTS "Pendiente de Entrega" (
  "Numero_pendiente" INTEGER,
  "Numero_factura" INTEGER,
  "Vendido_cuenta" TEXT,
  "Direccion_cuenta" TEXT,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Unidad" TEXT
);

CREATE TABLE IF NOT EXISTS "Pendiente de Entrega Auxiliar" (
  "Numero_pendiente" INTEGER,
  "Numero_factura" INTEGER,
  "Vendido_cuenta" TEXT,
  "Direccion_cuenta" TEXT,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Unidad" TEXT
);

CREATE TABLE IF NOT EXISTS "Periodos" (
  "Periodo_numero" INTEGER,
  "Fecha_desde" TEXT,
  "Fecha_hasta" TEXT
);

CREATE TABLE IF NOT EXISTS "PrestamoCooperativa Acumulado" (
  "Numero_empleado" INTEGER,
  "Acumulado" REAL
);

CREATE TABLE IF NOT EXISTS "Prestamos" (
  "Numero_empleado" INTEGER,
  "Prestamos" REAL,
  "Fecha_prestamos" TEXT,
  "Pagos_Prestamos" INTEGER,
  "BalancePrestamos" REAL,
  "Deduccion_prestamos" REAL,
  "Activado" INTEGER,
  "Secuencia" INTEGER,
  "Prestamo_real" REAL,
  "Asiento_numero" INTEGER
);

CREATE TABLE IF NOT EXISTS "Prestamos Acumulado" (
  "Numero_empleado" INTEGER,
  "Acumulado" REAL
);

CREATE TABLE IF NOT EXISTS "Prestamos Bancarios" (
  "Numero_prestamo" TEXT,
  "Nombre_banco" TEXT,
  "Monto" REAL,
  "Fecha_prestamo" TEXT,
  "Cuenta_debitar" TEXT,
  "Cuenta_acreditar" TEXT,
  "Numero_asiento" INTEGER,
  "Tipo_prestamo" TEXT,
  "Comentario" TEXT,
  "Cuenta_corriente" TEXT
);

CREATE TABLE IF NOT EXISTS "Prestamos cooperativa" (
  "Numero_empleado" INTEGER,
  "Prestamo_cooperativa" REAL,
  "Fecha_Cooperativa" TEXT,
  "Pagos_cooperativa" INTEGER,
  "BalanceCooperativa" REAL,
  "Deduccion_cooperativa" REAL,
  "Activado" INTEGER,
  "Secuencia" INTEGER,
  "Asiento_numero" INTEGER
);

CREATE TABLE IF NOT EXISTS "Producto Debitados" (
  "Numero_debito" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Unidad" TEXT
);

CREATE TABLE IF NOT EXISTS "Producto Debitados Auxiliar" (
  "Numero_debito" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Unidad" TEXT
);

CREATE TABLE IF NOT EXISTS "Productos Acreditados en Compras" (
  "Numero_credito" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" INTEGER,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Unidad" TEXT
);

CREATE TABLE IF NOT EXISTS "Productos Acreditados en Compras Auxiliar" (
  "Numero_credito" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" INTEGER,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Unidad" TEXT
);

CREATE TABLE IF NOT EXISTS "Productos Cotizafos" (
  "Numero_cotizacion" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Unidad" TEXT,
  "Costo_producto" REAL,
  "ITBIS" REAL,
  "Descuento" REAL,
  "Recargo" REAL,
  "Porciento_ITBIS" REAL
);

CREATE TABLE IF NOT EXISTS "Productos Oferta" (
  "Codigo_oferta" TEXT,
  "Codigo_producto" TEXT,
  "Cantidad" REAL
);

CREATE TABLE IF NOT EXISTS "Productos Ordenados" (
  "Numero_orden" INTEGER,
  "Cantidad" INTEGER,
  "Unidad" TEXT,
  "Articulo" TEXT,
  "Precio" REAL,
  "Marca" TEXT,
  "Codigo_producto" TEXT,
  "fila" INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "Productos requeridos" (
  "Numero_requisicion" INTEGER,
  "Cantidad" INTEGER,
  "Unidad" TEXT,
  "Articulo" TEXT,
  "Precio" REAL,
  "Marca" TEXT,
  "Codigo_producto" TEXT,
  "Procesado" INTEGER,
  "id_almacen" INTEGER,
  "fila" INTEGER PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS "Productos_apartados" (
  "Numero_apartado" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Cantidad_cred" REAL,
  "Fecha_apartado" TEXT,
  "Unidad" TEXT,
  "Cod_barra" TEXT,
  "Factura_compra" INTEGER,
  "Fecha_compra" TEXT,
  "Cod_suplidor" INTEGER,
  "Precio_compra" REAL,
  "Fecha_entrada" TEXT,
  "Hora_entrada" TEXT,
  "Fecha_vencimiento" TEXT,
  "Numero_serie" TEXT,
  "ITBIS" REAL,
  "Descuento" REAL
);

CREATE TABLE IF NOT EXISTS "Productos_apartados Auxiliar" (
  "Numero_apartado" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Cantidad_cred" REAL,
  "Fecha_apartado" TEXT,
  "Unidad" TEXT,
  "Cod_barra" TEXT,
  "Factura_compra" INTEGER,
  "Fecha_compra" TEXT,
  "Cod_suplidor" INTEGER,
  "Precio_compra" REAL,
  "Fecha_entrada" TEXT,
  "Hora_entrada" TEXT,
  "Fecha_vencimiento" TEXT,
  "Numero_serie" TEXT,
  "ITBIS" REAL,
  "Descuento" REAL
);

CREATE TABLE IF NOT EXISTS "Productos_facturados_Memo" (
  "Numero_factura" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Cantidad_cred" REAL,
  "Fecha_factura" TEXT,
  "Unidad" TEXT,
  "Cod_barra" TEXT,
  "Factura_compra" INTEGER,
  "Fecha_compra" TEXT,
  "Cod_suplidor" INTEGER,
  "Precio_compra" REAL,
  "Fecha_entrada" TEXT,
  "Hora_entrada" TEXT,
  "Fecha_vencimiento" TEXT,
  "Numero_serie" TEXT,
  "ITBIS" REAL,
  "Descuento" REAL,
  "Marca" TEXT,
  "Codigo_cuenta" TEXT,
  "Procesado" INTEGER,
  "id_almacen" INTEGER
);

CREATE TABLE IF NOT EXISTS "Productos_temporal" (
  "fila" INTEGER PRIMARY KEY,
  "Numero_factura" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Cantidad_cred" REAL,
  "Fecha_factura" TEXT,
  "Unidad" TEXT,
  "Cod_barra" TEXT,
  "Factura_compra" INTEGER,
  "Fecha_compra" TEXT,
  "Cod_suplidor" TEXT,
  "Precio_compra" REAL,
  "Fecha_entrada" TEXT,
  "Hora_entrada" TEXT,
  "Fecha_vencimiento" TEXT,
  "Numero_serie" TEXT,
  "ITBIS" REAL,
  "Descuento" REAL,
  "Marca" TEXT
);

CREATE TABLE IF NOT EXISTS "Productos_temporal_cotizacion" (
  "fila" INTEGER PRIMARY KEY,
  "Numero_factura" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Cantidad_cred" REAL,
  "Fecha_factura" TEXT,
  "Unidad" TEXT,
  "Cod_barra" TEXT,
  "Factura_compra" INTEGER,
  "Fecha_compra" TEXT,
  "Cod_suplidor" INTEGER,
  "Precio_compra" REAL,
  "Fecha_entrada" TEXT,
  "Hora_entrada" TEXT,
  "Fecha_vencimiento" TEXT,
  "Numero_serie" TEXT,
  "ITBIS" REAL,
  "Descuento" REAL,
  "Marca" TEXT
);

CREATE TABLE IF NOT EXISTS "Productos_temporal_ordenes" (
  "fila" INTEGER PRIMARY KEY,
  "Numero_orden" INTEGER,
  "Codigo_producto" TEXT,
  "Cantidad" REAL,
  "Descripcion" TEXT,
  "Precio_unitario" REAL,
  "Cantidad_cred" REAL,
  "Fecha_orden" TEXT,
  "Unidad" TEXT,
  "Cod_barra" TEXT,
  "Factura_compra" INTEGER,
  "Fecha_compra" TEXT,
  "Cod_suplidor" INTEGER,
  "Precio_compra" REAL,
  "Fecha_entrada" TEXT,
  "Hora_entrada" TEXT,
  "Fecha_vencimiento" TEXT,
  "Numero_serie" TEXT,
  "ITBIS" REAL,
  "Descuento" REAL,
  "Marca" TEXT
);

CREATE TABLE IF NOT EXISTS "Productos_vencimiento" (
  "Numero_factura" INTEGER,
  "Codigo_articulo" TEXT,
  "Cantidad" REAL,
  "Ano_vencimiento" INTEGER,
  "Mes_vencimiento" INTEGER,
  "Codigo_suplidor" INTEGER,
  "Factura_compra" INTEGER,
  "Fecha_vencimiento" TEXT
);

CREATE TABLE IF NOT EXISTS "Productos_vencimiento Auxiliar" (
  "Numero_factura" INTEGER,
  "Codigo_articulo" TEXT,
  "Cantidad" REAL,
  "Ano_vencimiento" INTEGER,
  "Mes_vencimiento" INTEGER,
  "Codigo_suplidor" INTEGER,
  "Factura_compra" INTEGER,
  "Fecha_vencimiento" TEXT
);

CREATE TABLE IF NOT EXISTS "Rec_datos" (
  "Ano" INTEGER,
  "Mes" INTEGER,
  "Cambio" TEXT,
  "Iniciar" TEXT,
  "IniciarCR" TEXT,
  "Metodo" TEXT,
  "SecuenciaCR" INTEGER,
  "Secuencia" INTEGER,
  "Periodo_contable" INTEGER,
  "Fecha_auto" TEXT,
  "SecuenciaCRRojo" INTEGER,
  "SecuenciaRojo" INTEGER,
  "SecuenciaNCCredito" INTEGER,
  "SecuenciaNCCreditoRojo" INTEGER,
  "SecuenciaNC" INTEGER,
  "SecuenciaNCRojo" INTEGER,
  "SecuenciaNDCredito" INTEGER,
  "SecuenciaNDCreditoRojo" INTEGER,
  "SecuenciaND" INTEGER,
  "SecuenciaNDRojo" INTEGER,
  "Fecha" TEXT
);

CREATE TABLE IF NOT EXISTS "Requisicion de Mercancia" (
  "Numero_requisicion" INTEGER NOT NULL,
  "fecha_requisicion" TEXT,
  "requerido_por" INTEGER,
  "monto_requisicion" REAL,
  "descuento" REAL,
  "itbis" REAL,
  "vendedor" TEXT,
  "procesada" INTEGER,
  "procesada_por" TEXT,
  "fecha_proceso" TEXT
);

CREATE TABLE IF NOT EXISTS "Retiros" (
  "Turno" INTEGER,
  "Fecha" TEXT,
  "Monto" REAL,
  "Concepto" TEXT,
  "Impreso" INTEGER,
  "Vendedor" TEXT,
  "id_almacen" INTEGER,
  "NCF" TEXT,
  "Tipo_retiro" TEXT
);

CREATE TABLE IF NOT EXISTS "Retiros de la Cooperativa" (
  "Numero_empleado" INTEGER,
  "Fecha_retiro" TEXT,
  "Cantidad" REAL,
  "Num_cheque" INTEGER
);

CREATE TABLE IF NOT EXISTS "RNC" (
  "RNC" TEXT,
  "Empresa" TEXT
);

CREATE TABLE IF NOT EXISTS "RNC cache" (
  "RNC" TEXT,
  "Empresa" TEXT
);

CREATE TABLE IF NOT EXISTS "Secuencia BarCode" (
  "Fecha" TEXT,
  "Secuencia" INTEGER
);

CREATE TABLE IF NOT EXISTS "Seguro Privado Acumulado" (
  "Numero_empleado" INTEGER,
  "Acumulado" REAL
);

CREATE TABLE IF NOT EXISTS "Seguro Social Acumulado" (
  "Numero_empleado" INTEGER,
  "Acumulado" REAL
);

CREATE TABLE IF NOT EXISTS "Sin Ponche de Salida" (
  "Numero_empleado" INTEGER,
  "Hora" TEXT,
  "Fecha" TEXT
);

CREATE TABLE IF NOT EXISTS "Tazas Monedas" (
  "Dollar" REAL,
  "Euro" REAL
);

CREATE TABLE IF NOT EXISTS "Tipos de Comida" (
  "Tipo" TEXT,
  "Precio" REAL
);

CREATE TABLE IF NOT EXISTS "Tipos de Empresa" (
  "Tipo" TEXT
);

CREATE TABLE IF NOT EXISTS "Turnos" (
  "Numero" INTEGER,
  "Vendedor" INTEGER,
  "De_Facturas" INTEGER,
  "A_Facturas" INTEGER
);

CREATE TABLE IF NOT EXISTS "Usuarios" (
  "Nombre_usuario" TEXT,
  "Clave" TEXT,
  "Tipo" TEXT,
  "Contabilidad" INTEGER,
  "Registrar_gerentes" INTEGER,
  "Registrar_clientes" INTEGER,
  "Registrar_suplidores" INTEGER,
  "Ventas" INTEGER,
  "Devoluciones" INTEGER,
  "Cobrar" INTEGER,
  "Pagar" INTEGER,
  "Compras" INTEGER,
  "Inventario" INTEGER,
  "Cuentas_bancarias" INTEGER,
  "Reportes" INTEGER,
  "Usuarios" INTEGER,
  "Sucursales" INTEGER,
  "Nomina" INTEGER,
  "Cambiar_precio" INTEGER,
  "Hacer_descuentos" INTEGER,
  "Comision" REAL,
  "id_almacen" INTEGER,
  "Cerrar_turno" INTEGER
);

CREATE TABLE IF NOT EXISTS "Vacaciones" (
  "Numero_empleado" INTEGER,
  "Semana_numero" INTEGER,
  "Dias_vacaciones" INTEGER
);

CREATE TABLE IF NOT EXISTS "Vacaciones Acumuladas" (
  "Numero_empleado" INTEGER,
  "Dias_vacaciones" INTEGER
);

CREATE TABLE IF NOT EXISTS "Vencimiento" (
  "Codigo_articulo" TEXT,
  "Cantidad" REAL,
  "Codigo_suplidor" INTEGER,
  "Factura_compra" INTEGER,
  "Ano_vencimiento" INTEGER,
  "Mes_vencimiento" INTEGER,
  "Fecha_vencimiento" TEXT
);

CREATE TABLE IF NOT EXISTS "Vendedores" (
  "Codigo" INTEGER,
  "Nombre" TEXT,
  "Nombre_completo" TEXT,
  "Clave" TEXT,
  "Comision" REAL,
  "id_almacen" INTEGER
);

