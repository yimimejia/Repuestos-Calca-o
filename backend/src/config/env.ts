import dotenv from 'dotenv';

dotenv.config();

export const env = {
  puerto: Number(process.env.PUERTO ?? 3000),
  jwtSecreto: process.env.JWT_SECRETO ?? 'super-secreto-local',
  adminOverridePassword: process.env.ADMIN_OVERRIDE_PASSWORD ?? 'admin123',
  dbPath: process.env.DB_PATH ?? './pos-local.db',
  dgiiRncPageUrl: process.env.DGII_RNC_PAGE_URL ?? 'https://dgii.gov.do/app/WebApps/ConsultasWeb2/ConsultasWeb/consultas/rnc.aspx',
  dgiiRncCsvUrl: process.env.DGII_RNC_CSV_URL ?? 'https://dgii.gov.do/app/WebApps/Consultas/RNC/RNC_CONTRIBUYENTES.zip',
  dgiiRncTxtUrl: process.env.DGII_RNC_TXT_URL ?? 'https://dgii.gov.do/app/WebApps/Consultas/RNC/DGII_RNC.zip',
  dgiiRncSyncEnabled: String(process.env.DGII_RNC_SYNC_ENABLED ?? 'true') === 'true',
  dgiiRncSyncCron: process.env.DGII_RNC_SYNC_CRON ?? '0 3 * * *',
  dgiiRncTimeoutMs: Number(process.env.DGII_RNC_TIMEOUT_MS ?? 30000),
};
