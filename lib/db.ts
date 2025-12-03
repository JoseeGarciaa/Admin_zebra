import { Pool, type QueryResult, type QueryResultRow } from "pg"

import { getDatabaseConfig } from "./config"

const globalForPool = globalThis as unknown as {
  pgPool?: Pool
}

const pool = globalForPool.pgPool ?? new Pool(getDatabaseConfig())

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
