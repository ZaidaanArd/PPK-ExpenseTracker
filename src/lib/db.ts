import { Pool } from "pg";

const globalForDb = globalThis as typeof globalThis & { dbPool?: Pool };

export function getDb(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diatur. Salin .env.example ke .env.local dan isi kredensial PostgreSQL.");
  }

  if (!globalForDb.dbPool) {
    globalForDb.dbPool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  return globalForDb.dbPool;
}
