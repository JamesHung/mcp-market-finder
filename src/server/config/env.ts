import { LOOKUP_CONSTRAINTS } from "../../shared/contracts/lookup";

export interface AppEnv {
  apiPort: number;
  databaseUrl: string;
  mcpMarketBaseUrl: string;
  requestTimeoutMs: number;
  nodeEnv: string;
}

function parseNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

export function readAppEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  return {
    apiPort: parseNumber(source.API_PORT, 8787),
    databaseUrl:
      source.DATABASE_URL ??
      "postgres://postgres:postgres@localhost:5432/mcp_market_finder",
    mcpMarketBaseUrl:
      source.MCPMARKET_BASE_URL ?? "https://mcpmarket.com",
    requestTimeoutMs: parseNumber(
      source.REQUEST_TIMEOUT_MS,
      LOOKUP_CONSTRAINTS.requestTimeoutMs,
    ),
    nodeEnv: source.NODE_ENV ?? "development",
  };
}
