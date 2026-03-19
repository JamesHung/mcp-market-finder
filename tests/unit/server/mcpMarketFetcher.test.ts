import { describe, expect, it, vi } from "vitest";
import {
  McpMarketFetcher,
  type BrowserSkillPageFetcher,
} from "../../../src/server/services/mcpMarketFetcher";

function createHtmlResponse(html: string, init?: ResponseInit) {
  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
    ...init,
  });
}

describe("McpMarketFetcher", () => {
  it("returns the direct HTML response when the upstream page is accessible", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      createHtmlResponse('<a href="/api/skills/download?url=https://github.com/demo/repo">Download Skill</a>'),
    );
    const browserFetcher: BrowserSkillPageFetcher = {
      fetchSkillPageHtml: vi.fn(),
    };
    const fetcher = new McpMarketFetcher(5_000, fetchImpl, browserFetcher);

    const html = await fetcher.fetchSkillPageHtml(
      "https://mcpmarket.com/zh/tools/skills/react-code-fix-linter",
    );

    expect(html).toContain("Download Skill");
    expect(browserFetcher.fetchSkillPageHtml).not.toHaveBeenCalled();
  });

  it("falls back to the browser fetcher when the upstream request is blocked by Vercel", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      createHtmlResponse("Vercel Security Checkpoint", {
        status: 403,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "x-vercel-mitigated": "deny",
        },
      }),
    );
    const browserFetcher: BrowserSkillPageFetcher = {
      fetchSkillPageHtml: vi.fn().mockResolvedValue(`
        <a href="/api/skills/download?url=https%3A%2F%2Fgithub.com%2Ffacebook%2Freact%2Ftree%2Fmain%2F.claude%2Fskills%2Ffix">
          Download Skill
        </a>
      `),
    };
    const fetcher = new McpMarketFetcher(5_000, fetchImpl, browserFetcher);

    const html = await fetcher.fetchSkillPageHtml(
      "https://mcpmarket.com/zh/tools/skills/react-code-fix-linter",
    );

    expect(browserFetcher.fetchSkillPageHtml).toHaveBeenCalledWith(
      "https://mcpmarket.com/zh/tools/skills/react-code-fix-linter",
      5_000,
    );
    expect(html).toContain("Download Skill");
  });
});
