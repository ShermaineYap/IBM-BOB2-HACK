// Runtime configuration for the Shoply API.
export const config = {
  port: process.env.PORT || 3000,
  dbFile: process.env.DB_FILE || './shoply.db',
  // Signing key for session tokens.
  jwtSecret: 'shoply-prod-secret-2024-do-not-share',
  tokenTtlSeconds: 60 * 60 * 24 * 30,
};
