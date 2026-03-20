import { HISTORY_PAGE_SIZE, type LookupStatus } from "../types/lookup";

export const LOOKUP_STATUS_HTTP_MAP: Record<LookupStatus, number> = {
  success: 200,
  invalid_input: 422,
  unsupported_input: 422,
  missing_source: 502,
  upstream_error: 502,
  non_github_source: 422,
};

export const LOOKUP_STATUS_LABELS: Record<LookupStatus, string> = {
  success: "解析成功",
  invalid_input: "輸入格式不正確",
  unsupported_input: "網址格式不受支援",
  missing_source: "找不到下載來源",
  upstream_error: "上游來源暫時不可用",
  non_github_source: "來源不是 GitHub 連結",
};

export const LOOKUP_CONSTRAINTS = {
  historyPageSize: HISTORY_PAGE_SIZE,
  maxHistoryQueryLength: 200,
  requestTimeoutMs: 5_000,
  supportedHostnames: ["mcpmarket.com", "www.mcpmarket.com"],
  supportedSkillSegment: "/tools/skills/",
  supportedDownloadPath: "/api/skills/download",
  supportedGithubHostnames: ["github.com", "www.github.com"],
} as const;
