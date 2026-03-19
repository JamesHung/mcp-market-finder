import { describe, expect, it } from "vitest";
import {
  extractDownloadUrlFromHtml,
  normalizeGithubUrlFromDownloadUrl,
  parseMcpMarketInput,
} from "../../../src/server/parsers/mcpMarketParser";

describe("mcpMarketParser", () => {
  it("parses a skill detail page URL", () => {
    const result = parseMcpMarketInput(
      "https://mcpmarket.com/zh/tools/skills/react-code-fix-linter/",
    );

    expect(result.ok).toBe(true);

    if (!result.ok) {
      return;
    }

    expect(result.value.inputType).toBe("skill_page");
    expect(result.value.skillSlug).toBe("react-code-fix-linter");
    expect(result.value.normalizedInputUrl).toBe(
      "https://mcpmarket.com/zh/tools/skills/react-code-fix-linter",
    );
  });

  it("parses a download API URL and normalizes the GitHub target", () => {
    const input =
      "https://mcpmarket.com/api/skills/download?url=https%3A%2F%2Fgithub.com%2Ffacebook%2Freact%2Ftree%2Fmain%2F.claude%2Fskills%2Ffix";
    const parseResult = parseMcpMarketInput(input);

    expect(parseResult.ok).toBe(true);

    const githubResult = normalizeGithubUrlFromDownloadUrl(input);

    expect(githubResult).toEqual({
      ok: true,
      githubUrl:
        "https://github.com/facebook/react/tree/main/.claude/skills/fix",
    });
  });

  it("extracts the download URL from skill page HTML", () => {
    const html = `
      <main>
        <a href="/api/skills/download?url=https%3A%2F%2Fgithub.com%2Ffacebook%2Freact%2Ftree%2Fmain%2F.claude%2Fskills%2Ffix">
          Download Skill
        </a>
      </main>
    `;

    expect(
      extractDownloadUrlFromHtml(
        html,
        "https://mcpmarket.com/zh/tools/skills/react-code-fix-linter",
      ),
    ).toBe(
      "https://mcpmarket.com/api/skills/download?url=https%3A%2F%2Fgithub.com%2Ffacebook%2Freact%2Ftree%2Fmain%2F.claude%2Fskills%2Ffix",
    );
  });

  it("rejects non GitHub download targets", () => {
    expect(
      normalizeGithubUrlFromDownloadUrl(
        "https://mcpmarket.com/api/skills/download?url=https%3A%2F%2Fgitlab.com%2Fgroup%2Frepo",
      ),
    ).toEqual({
      ok: false,
      status: "non_github_source",
      errorCode: "NON_GITHUB_SOURCE",
      errorMessage: "解析出的來源不是 GitHub 連結。",
    });
  });
});
