import { readdir, readFile } from "node:fs/promises";
import { join, fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diatur dalam .env.local");
}

const migrationsDir = fileURLToPath(new URL("../db/migrations", import.meta.url));
const files = (await readdir(migrationsDir)).filter((name) => name.endsWith(".sql")).sort();

if (files.length === 0) {
  console.log("Tidak ada file migrasi di db/migrations.");
  process.exit(0);
}

const client = new Client({ connectionString: process.env.DATABASE_URL });

try {
  await client.connect();
  for (const name of files) {
    const sql = await readFile(join(migrationsDir, name), "utf8");
    await client.query(sql);
    console.log(`Migrasi diterapkan: ${name}`);
  }
  console.log("Semua migrasi selesai diterapkan.");
} finally {
  await client.end();
}
