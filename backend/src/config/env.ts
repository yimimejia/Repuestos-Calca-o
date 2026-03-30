import dotenv from 'dotenv';

dotenv.config();

export const env = {
  puerto: Number(process.env.PUERTO ?? 3000),
  jwtSecreto: process.env.JWT_SECRETO ?? 'super-secreto-local',
  adminOverridePassword: process.env.ADMIN_OVERRIDE_PASSWORD ?? 'admin123',
  dbPath: process.env.DB_PATH ?? './pos-local.db',
};
