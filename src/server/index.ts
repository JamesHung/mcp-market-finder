import { createApp } from "./app";
import { readAppEnv } from "./config/env";
import { getPgPool } from "./db/pool";
import { LookupRepository } from "./repositories/lookupRepository";
import { LookupService } from "./services/lookupService";
import { McpMarketFetcher } from "./services/mcpMarketFetcher";

const env = readAppEnv();
const pool = getPgPool(env);
const repository = new LookupRepository(pool);
const fetcher = new McpMarketFetcher(env.requestTimeoutMs);
const lookupService = new LookupService(repository, fetcher);
const app = createApp(lookupService);

app.listen(env.apiPort, () => {
  console.log(`API listening on http://localhost:${env.apiPort}`);
});
