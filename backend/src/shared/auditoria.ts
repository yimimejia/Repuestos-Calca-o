import { v4 as uuid } from 'uuid';
import { db } from '../db/connection.js';

export function registrarAuditoria(entidad: string, entidadId: string, accion: string, descripcion: string, usuarioId?: string) {
  db.prepare('INSERT INTO auditoria_logs(id,entidad,entidad_id,accion,descripcion,usuario_id,fecha_creacion) VALUES(?,?,?,?,?,?,?)')
    .run(uuid(), entidad, entidadId, accion, descripcion, usuarioId ?? null, new Date().toISOString());
}
