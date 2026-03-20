import { Pool, type PoolConfig, type QueryResult } from "pg";
import type { AppEnv } from "../config/env";

export interface Queryable {
  query<Row extends object>(
    text: string,
    params?: readonly unknown[],
  ): Promise<Pick<QueryResult<Row>, "rows" | "rowCount">>;
}

let sharedPool: Pool | undefined;

export function createPgPool(env: AppEnv) {
  const config: PoolConfig = {
    connectionString: env.databaseUrl,
    max: 10,
  };

  return new Pool(config);
}

export function getPgPool(env: AppEnv) {
  if (!sharedPool) {
    sharedPool = createPgPool(env);
  }

  return sharedPool;
}

export async function closePgPool() {
  if (!sharedPool) {
    return;
  }

  await sharedPool.end();
  sharedPool = undefined;
}
