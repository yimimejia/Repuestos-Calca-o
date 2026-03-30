import { db } from '../../db/connection.js';

// Base local-first: cola outbox lista para sincronización idempotente hacia nube.
export function registrarOutbox(entidad: string, entidadId: string, tipoEvento: string, payload: unknown, idempotencyKey: string) {
  const now = new Date().toISOString();
  db.prepare(`INSERT OR IGNORE INTO sync_outbox(id,entidad,entidad_id,tipo_evento,payload_json,idempotency_key,estado_sync,intentos,fecha_creacion,fecha_actualizacion)
    VALUES(hex(randomblob(16)),?,?,?,?,?,'pendiente',0,?,?)`)
    .run(entidad, entidadId, tipoEvento, JSON.stringify(payload), idempotencyKey, now, now);
}
