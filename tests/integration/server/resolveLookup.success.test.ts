import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { createApp } from "../../../src/server/app";
import { LookupService } from "../../../src/server/services/lookupService";
import type { SkillPageFetcher } from "../../../src/server/services/mcpMarketFetcher";
import { InMemoryLookupRepository } from "../../helpers/inMemoryLookupRepository";

describe("POST /api/lookups/resolve success flow", () => {
  it("resolves a skill page URL into a download URL and GitHub link", async () => {
    const repository = new InMemoryLookupRepository();
    const fetcher: SkillPageFetcher = {
      fetchSkillPageHtml: vi.fn().mockResolvedValue(`
        <a href="/api/skills/download?url=https%3A%2F%2Fgithub.com%2Ffacebook%2Freact%2Ftree%2Fmain%2F.claude%2Fskills%2Ffix">
          Download Skill
        </a>
      `),
    };
    const app = createApp(new LookupService(repository, fetcher));

    const response = await request(app)
      .post("/api/lookups/resolve")
      .send({
        url: "https://mcpmarket.com/zh/tools/skills/react-code-fix-linter",
      });

    expect(response.status).toBe(200);
    expect(response.body.record.status).toBe("success");
    expect(response.body.record.downloadUrl).toContain(
      "/api/skills/download?url=",
    );
    expect(response.body.record.githubUrl).toBe(
      "https://github.com/facebook/react/tree/main/.claude/skills/fix",
    );
    expect(repository.getRecords()).toHaveLength(1);
  });

  it("accepts a direct download URL without fetching the skill page again", async () => {
    const repository = new InMemoryLookupRepository();
    const fetcher: SkillPageFetcher = {
      fetchSkillPageHtml: vi.fn(),
    };
    const app = createApp(new LookupService(repository, fetcher));

    const response = await request(app)
      .post("/api/lookups/resolve")
      .send({
        url: "https://mcpmarket.com/api/skills/download?url=https%3A%2F%2Fgithub.com%2Ffacebook%2Freact%2Ftree%2Fmain%2F.claude%2Fskills%2Ffix",
      });

    expect(response.status).toBe(200);
    expect(response.body.record.inputType).toBe("download_api");
    expect(fetcher.fetchSkillPageHtml).not.toHaveBeenCalled();
  });
});
