# Arquitectura Local-First (obligatoria)

## Núcleo
- Servidor local (LAN) como fuente operativa principal.
- Terminales vendedor/cajero/admin conectadas al API local.
- WebSocket local para tiempo real sin internet.

## Sincronización remota
- Tabla `sync_outbox` como cola de eventos pendientes.
- Eventos idempotentes con `idempotency_key`.
- Reintentos automáticos al volver internet.

## Reglas críticas
1. Venta emitida != cobro != saldo pendiente.
2. Crédito no suma efectivo esperado hasta cobro real.
3. Cuadre toma datos desde último cuadre, no por día.
4. Evitar doble cobro con estado `en_caja` + bloqueo lógico.
