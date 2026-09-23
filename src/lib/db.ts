import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "@/db/schema";

const globalForDb = globalThis as typeof globalThis & { dbPool?: Pool };

export function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL belum diatur. Salin .env.example ke .env.local dan isi kredensial PostgreSQL.");
  }

  if (!globalForDb.dbPool) {
    globalForDb.dbPool = new Pool({ connectionString: process.env.DATABASE_URL });
  }

  return drizzle(globalForDb.dbPool, { schema });
}
