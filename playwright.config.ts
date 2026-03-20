import { defineConfig } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 4173);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: false,
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    headless: true,
  },
  webServer: {
    command: `E2E_PORT=${port} tsx tests/e2e/testServer.ts`,
    port,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
