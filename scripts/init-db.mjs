import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diatur dalam .env.local");
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
const schemaPath = fileURLToPath(new URL("../db/schema.sql", import.meta.url));

try {
  await client.connect();
  await client.query(await readFile(schemaPath, "utf8"));
  console.log("Skema PostgreSQL berhasil disiapkan.");
} finally {
  await client.end();
}
