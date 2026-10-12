import pg from "pg";

export function createDatabasePool() {
  const pool = new pg.Pool({
    connectionTimeoutMillis: 5000,
  });

  pool.on("error", (error) => {
    console.error("Database pool error:", error.message);
  });

  return pool;
}