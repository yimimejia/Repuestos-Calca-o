import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import type { Rol } from './types.js';

export interface UsuarioSesion {
  id: string;
  username: string;
  nombre: string;
  rol: Rol;
}

export function firmarToken(usuario: UsuarioSesion) {
  return jwt.sign(usuario, env.jwtSecreto, { expiresIn: '12h' });
}

export function auth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No autorizado' });
  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, env.jwtSecreto) as UsuarioSesion;
    (req as any).usuario = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

export function permitir(...roles: Rol[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const usuario = (req as any).usuario as UsuarioSesion | undefined;
    if (!usuario) return res.status(401).json({ error: 'No autorizado' });
    if (!roles.includes(usuario.rol)) return res.status(403).json({ error: 'Sin permisos' });
    next();
  };
}
