const DEFAULT_DB_HOST = "72.60.25.130"
const DEFAULT_DB_PORT = 5432
const DEFAULT_DB_NAME = "zebra_col"
const DEFAULT_DB_USER = "admin"
const DEFAULT_DB_PASSWORD = "Ventas2025"
const DEFAULT_DB_SSL = false

export function getDatabaseConfig() {
  const sslFlag = process.env.POSTGRES_SSL ?? (DEFAULT_DB_SSL ? "true" : "false")
  const sslEnabled = sslFlag.toLowerCase() === "true"

  return {
    host: process.env.POSTGRES_HOST ?? DEFAULT_DB_HOST,
    port: Number(process.env.POSTGRES_PORT ?? DEFAULT_DB_PORT),
    database: process.env.POSTGRES_DB ?? DEFAULT_DB_NAME,
    user: process.env.POSTGRES_USER ?? DEFAULT_DB_USER,
    password: process.env.POSTGRES_PASSWORD ?? DEFAULT_DB_PASSWORD,
    ssl: sslEnabled
      ? {
          rejectUnauthorized: false,
        }
      : false,
  }
}
