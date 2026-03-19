import { describe, expect, it, vi } from "vitest";
import { LookupService } from "../../../src/server/services/lookupService";
import type { SkillPageFetcher } from "../../../src/server/services/mcpMarketFetcher";
import { InMemoryLookupRepository } from "../../helpers/inMemoryLookupRepository";

describe("LookupService failure classification", () => {
  it("marks unsupported hosts as invalid input", async () => {
    const service = new LookupService(new InMemoryLookupRepository(), {
      fetchSkillPageHtml: vi.fn(),
    });

    const response = await service.resolve({
      url: "https://example.com/not-supported",
    });

    expect("error" in response).toBe(true);

    if (!("error" in response)) {
      return;
    }

    expect(response.record.status).toBe("invalid_input");
    expect(response.error.code).toBe("INVALID_HOST");
  });

  it("marks skill pages without download links as missing source", async () => {
    const fetcher: SkillPageFetcher = {
      fetchSkillPageHtml: vi.fn().mockResolvedValue("<main>No link</main>"),
    };
    const service = new LookupService(new InMemoryLookupRepository(), fetcher);

    const response = await service.resolve({
      url: "https://mcpmarket.com/zh/tools/skills/react-code-fix-linter",
    });

    expect("error" in response).toBe(true);

    if (!("error" in response)) {
      return;
    }

    expect(response.record.status).toBe("missing_source");
    expect(response.error.code).toBe("MISSING_DOWNLOAD_URL");
  });

  it("marks non GitHub targets as unsupported sources", async () => {
    const service = new LookupService(new InMemoryLookupRepository(), {
      fetchSkillPageHtml: vi.fn(),
    });

    const response = await service.resolve({
      url: "https://mcpmarket.com/api/skills/download?url=https%3A%2F%2Fgitlab.com%2Fgroup%2Frepo",
    });

    expect("error" in response).toBe(true);

    if (!("error" in response)) {
      return;
    }

    expect(response.record.status).toBe("non_github_source");
    expect(response.error.code).toBe("NON_GITHUB_SOURCE");
  });
});
