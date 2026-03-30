# Importador SQL legado (SQL Server -> SQLite)

## Motor actual detectado
El proyecto usa **SQLite** (`better-sqlite3`) y no ejecuta el dump SQL Server directo.

## Flujo
1. Panel admin -> **Importar base SQL legada**.
2. Subir `.sql`.
3. `POST /api/importador/analizar`:
   - separa por `GO`,
   - detecta `INSERT INTO`,
   - ignora bloques peligrosos (`CREATE DATABASE`, `ALTER DATABASE`, `USE master`, etc),
   - crea `import_jobs` + `import_staging_rows`.
4. `GET /api/importador/jobs/:id/preview` para vista previa.
5. `POST /api/importador/jobs/:id/importar`:
   - soporta `dry_run`.
   - importa por módulos (`clientes`, `suplidores`, `productos`, `compras`, `ventas`, etc).
6. `POST /api/importador/jobs/:id/confirmar` para fijar importación.
7. `POST /api/importador/jobs/:id/undo` para deshacer si no se confirmó.
8. `GET /api/importador/jobs/:id/logs` descarga log.

## Staging y trazabilidad
- `import_jobs`
- `import_staging_rows`
- `import_logs`
- `import_imported_refs`

## Seguridad
- No se ejecuta el SQL legado en la base principal.
- Todo se transforma a objetos JSON staging.
- Importación por bloques en transacciones.
