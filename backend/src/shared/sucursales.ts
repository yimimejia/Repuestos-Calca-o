import { db } from '../db/connection.js';

export function usuarioPuedeSucursal(usuarioId: string, rol: string, sucursalId: string) {
  if (rol === 'administrador') return true;
  const row = db.prepare('SELECT 1 FROM usuarios_sucursales WHERE usuario_id=? AND sucursal_id=?').get(usuarioId, sucursalId);
  return !!row;
}

export function exigirSucursalUsuario(usuarioId: string, rol: string, sucursalId?: string) {
  if (!sucursalId) throw new Error('Sucursal es obligatoria');
  if (!usuarioPuedeSucursal(usuarioId, rol, sucursalId)) throw new Error('Usuario no autorizado para operar esta sucursal');
}
