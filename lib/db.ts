import { Pool, type QueryResult, type QueryResultRow } from "pg"

const globalForPool = globalThis as unknown as {
  pgPool?: Pool
}

const pool =
  globalForPool.pgPool ??
  new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT ?? "5432"),
    database: process.env.POSTGRES_DB,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl:
      process.env.POSTGRES_SSL === "true"
        ? {
            rejectUnauthorized: false,
          }
        : false,
  })

if (process.env.NODE_ENV !== "production") {
  globalForPool.pgPool = pool
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  const client = await pool.connect()

  try {
    return await client.query<T>(text, params)
  } finally {
    client.release()
  }
}
