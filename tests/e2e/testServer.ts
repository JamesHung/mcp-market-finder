import express from "express";
import { createServer as createViteServer } from "vite";
import { createApp } from "../../src/server/app";
import { LookupService } from "../../src/server/services/lookupService";
import type { SkillPageFetcher } from "../../src/server/services/mcpMarketFetcher";
import { InMemoryLookupRepository } from "../helpers/inMemoryLookupRepository";
import {
  blockedSkillPageUrl,
  downloadUrl,
  skillPageUrl,
} from "./fixtures";

const port = Number(process.env.E2E_PORT ?? 4173);

const fetcher: SkillPageFetcher = {
  async fetchSkillPageHtml(url) {
    if (url === skillPageUrl) {
      return `<a href="${downloadUrl}">Download Skill</a>`;
    }

    if (url === blockedSkillPageUrl) {
      throw new Error("Upstream blocked the skill page request.");
    }

    throw new Error(`Unexpected skill page URL: ${url}`);
  },
};

async function startServer() {
  const repository = new InMemoryLookupRepository();
  const app = express();
  const vite = await createViteServer({
    appType: "spa",
    server: {
      middlewareMode: true,
      hmr: false,
    },
  });

  app.post("/__e2e__/reset", (_request, response) => {
    repository.clear();
    response.status(204).end();
  });
  app.use(createApp(new LookupService(repository, fetcher)));
  app.use(vite.middlewares);

  const server = app.listen(port, "127.0.0.1", () => {
    console.log(`E2E server listening on http://127.0.0.1:${port}`);
  });

  const shutdown = async () => {
    await vite.close();
    server.close(() => {
      process.exit(0);
    });
  };

  process.once("SIGINT", () => {
    void shutdown();
  });
  process.once("SIGTERM", () => {
    void shutdown();
  });
}

void startServer();
