import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { readAppEnv } from "../src/server/config/env";
import { closePgPool, getPgPool } from "../src/server/db/pool";

async function run() {
  const env = readAppEnv();
  const sqlPath = resolve(process.cwd(), "db/migrations/001_create_lookup_records.sql");
  const sql = await readFile(sqlPath, "utf8");
  const pool = getPgPool(env);

  await pool.query(sql);
  await closePgPool();

  console.log("Database migration completed.");
}

run().catch(async (error: Error) => {
  console.error(error);
  await closePgPool();
  process.exitCode = 1;
});
