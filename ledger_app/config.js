// Runtime configuration. Every secret comes from the environment.
function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} must be set`);
  return value;
}

export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  webhookSecret: required('WEBHOOK_SECRET'),
  internalApiKey: required('INTERNAL_API_KEY'),
  uploadDir: process.env.UPLOAD_DIR || '/var/ledger/uploads',
  tokenTtl: '1h',
};
