# Repuestos Calcaño POS (Local-First)

Base inicial del sistema POS para operación en red local con sincronización a nube.

## Arquitectura

- `backend/`: API local principal + lógica de negocio + WebSocket en LAN.
- `frontend/`: interfaz moderna por roles (vendedor, cajero, administrador).
- `docs/`: decisiones de arquitectura y flujo operativo.

## Módulos implementados (base)

1. Autenticación y roles.
2. Ventas (contado y crédito).
3. Caja y cobros.
4. Cuentas por cobrar (abonos y saldo).
5. Cuadre de caja con autorización administrativa.
6. Reportes base para 607/608.
7. Estructura de sincronización local->remoto (outbox idempotente).

## Ejecutar backend

```bash
cd backend
npm install
npm run dev
```

Variables de entorno:

- `PUERTO=4000`
- `JWT_SECRETO=super-secreto-local`
- `ADMIN_OVERRIDE_PASSWORD=admin123`

## Notas fiscales

- 607: ventas y operaciones emitidas.
- 608: comprobantes anulados.
- 606: se deja estructura preparada para módulo futuro de compras/gastos.
