import { LOOKUP_CONSTRAINTS } from "../../shared/contracts/lookup";

export interface SkillPageFetcher {
  fetchSkillPageHtml(url: string): Promise<string>;
}

export interface BrowserSkillPageFetcher {
  fetchSkillPageHtml(url: string, timeoutMs: number): Promise<string>;
}

function isSecurityCheckpointHtml(html: string) {
  return html.includes("Vercel Security Checkpoint");
}

function shouldUseBrowserFallback(response: Response, html: string) {
  return (
    response.headers.get("x-vercel-mitigated") === "deny" ||
    response.status === 403 ||
    isSecurityCheckpointHtml(html)
  );
}

export const playwrightBrowserFetcher: BrowserSkillPageFetcher = {
  async fetchSkillPageHtml(url, timeoutMs) {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch({ headless: true });

    try {
      const page = await browser.newPage();
      await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: timeoutMs,
      });
      await page.waitForSelector('a[href*="/api/skills/download?url="]', {
        timeout: timeoutMs,
      });

      return await page.content();
    } finally {
      await browser.close();
    }
  },
};

export class McpMarketFetcher implements SkillPageFetcher {
  constructor(
    private readonly requestTimeoutMs: number = LOOKUP_CONSTRAINTS.requestTimeoutMs,
    private readonly fetchImpl: typeof fetch = fetch,
    private readonly browserFetcher: BrowserSkillPageFetcher = playwrightBrowserFetcher,
  ) {}

  async fetchSkillPageHtml(url: string) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        headers: {
          accept: "text/html,application/xhtml+xml",
          "user-agent": "mcp-market-finder/0.1",
        },
        signal: controller.signal,
      });
      const html = await response.text();

      if (response.ok && !isSecurityCheckpointHtml(html)) {
        return html;
      }

      if (shouldUseBrowserFallback(response, html)) {
        return await this.browserFetcher.fetchSkillPageHtml(
          url,
          this.requestTimeoutMs,
        );
      }

      throw new Error(`Upstream request failed with status ${response.status}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
