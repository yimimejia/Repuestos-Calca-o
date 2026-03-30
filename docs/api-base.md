# API base

## Auth
- `POST /api/auth/login`

## Ventas
- `POST /api/ventas`
- `POST /api/ventas/:id/enviar-cajero`
- `GET /api/ventas/pendientes`
- `POST /api/ventas/:id/tomar-en-caja`
- `POST /api/ventas/:id/cobrar`

## CxC
- `GET /api/cxc/pendientes`
- `POST /api/cxc/:id/cobrar`

## Cuadres
- `GET /api/cuadres/resumen`
- `POST /api/cuadres/cerrar`
- `GET /api/cuadres/historial`

## DGII
- `GET /api/reportes/dgii-607`
- `GET /api/reportes/dgii-608`
