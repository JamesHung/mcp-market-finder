import { load } from "cheerio";
import { LOOKUP_CONSTRAINTS } from "../../shared/contracts/lookup";
import type { InputType, LookupStatus } from "../../shared/types/lookup";

export interface ParsedLookupInput {
  inputUrl: string;
  normalizedInputUrl: string;
  inputType: InputType;
  skillSlug: string | null;
  downloadUrl: string | null;
}

export interface LookupParseFailure {
  ok: false;
  inputUrl: string;
  normalizedInputUrl: string;
  inputType: InputType;
  status: Exclude<LookupStatus, "success" | "missing_source" | "upstream_error" | "non_github_source">;
  errorCode: string;
  errorMessage: string;
}

export interface LookupParseSuccess {
  ok: true;
  value: ParsedLookupInput;
}

export type LookupParseResult = LookupParseSuccess | LookupParseFailure;

export interface GithubNormalizationSuccess {
  ok: true;
  githubUrl: string;
}

export interface GithubNormalizationFailure {
  ok: false;
  status: "invalid_input" | "non_github_source";
  errorCode: string;
  errorMessage: string;
}

export type GithubNormalizationResult =
  | GithubNormalizationSuccess
  | GithubNormalizationFailure;

function normalizeUrl(input: string) {
  const url = new URL(input);
  url.hash = "";

  if (url.pathname.length > 1) {
    url.pathname = url.pathname.replace(/\/+$/, "");
  }

  return url.toString();
}

function guessInputType(input: string): InputType {
  return input.includes(LOOKUP_CONSTRAINTS.supportedDownloadPath)
    ? "download_api"
    : "skill_page";
}

function isSupportedHostname(hostname: string) {
  return LOOKUP_CONSTRAINTS.supportedHostnames.includes(
    hostname as (typeof LOOKUP_CONSTRAINTS.supportedHostnames)[number],
  );
}

function extractSkillSlug(pathname: string) {
  const markerIndex = pathname.indexOf(LOOKUP_CONSTRAINTS.supportedSkillSegment);

  if (markerIndex < 0) {
    return null;
  }

  const afterMarker = pathname.slice(
    markerIndex + LOOKUP_CONSTRAINTS.supportedSkillSegment.length,
  );
  const slug = afterMarker.split("/")[0]?.trim() ?? "";

  return slug || null;
}

export function parseMcpMarketInput(rawInput: string): LookupParseResult {
  const inputUrl = rawInput.trim();
  const fallbackType = guessInputType(inputUrl);

  if (!inputUrl) {
    return {
      ok: false,
      inputUrl,
      normalizedInputUrl: inputUrl,
      inputType: fallbackType,
      status: "invalid_input",
      errorCode: "EMPTY_URL",
      errorMessage: "請輸入 mcpmarket.com 的 skill 頁面或 download URL。",
    };
  }

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(inputUrl);
  } catch {
    return {
      ok: false,
      inputUrl,
      normalizedInputUrl: inputUrl,
      inputType: fallbackType,
      status: "invalid_input",
      errorCode: "INVALID_URL",
      errorMessage: "輸入內容不是有效的絕對網址。",
    };
  }

  const normalizedInputUrl = normalizeUrl(parsedUrl.toString());

  if (!isSupportedHostname(parsedUrl.hostname)) {
    return {
      ok: false,
      inputUrl,
      normalizedInputUrl,
      inputType: fallbackType,
      status: "invalid_input",
      errorCode: "INVALID_HOST",
      errorMessage: "只支援 mcpmarket.com 的 skill 頁面或 download URL。",
    };
  }

  const skillSlug = extractSkillSlug(parsedUrl.pathname);

  if (skillSlug) {
    return {
      ok: true,
      value: {
        inputUrl,
        normalizedInputUrl,
        inputType: "skill_page",
        skillSlug,
        downloadUrl: null,
      },
    };
  }

  if (parsedUrl.pathname === LOOKUP_CONSTRAINTS.supportedDownloadPath) {
    if (!parsedUrl.searchParams.get("url")) {
      return {
        ok: false,
        inputUrl,
        normalizedInputUrl,
        inputType: "download_api",
        status: "invalid_input",
        errorCode: "MISSING_DOWNLOAD_TARGET",
        errorMessage: "download URL 缺少必要的來源參數。",
      };
    }

    return {
      ok: true,
      value: {
        inputUrl,
        normalizedInputUrl,
        inputType: "download_api",
        skillSlug: null,
        downloadUrl: normalizedInputUrl,
      },
    };
  }

  return {
    ok: false,
    inputUrl,
    normalizedInputUrl,
    inputType: fallbackType,
    status: "unsupported_input",
    errorCode: "UNSUPPORTED_PATH",
    errorMessage: "目前只支援 skill 詳情頁或 download URL。",
  };
}

export function extractDownloadUrlFromHtml(html: string, baseUrl: string) {
  const $ = load(html);

  const href =
    $('a[href*="/api/skills/download?url="]').first().attr("href") ??
    $('a[href*="mcpmarket.com/api/skills/download?url="]').first().attr("href");

  if (!href) {
    return null;
  }

  return new URL(href, baseUrl).toString();
}

function normalizeGithubTarget(rawTarget: string) {
  const trimmed = rawTarget.trim();
  const decoded = decodeURIComponent(trimmed);
  const githubUrl = new URL(decoded);

  if (
    !LOOKUP_CONSTRAINTS.supportedGithubHostnames.includes(
      githubUrl.hostname as (typeof LOOKUP_CONSTRAINTS.supportedGithubHostnames)[number],
    )
  ) {
    return null;
  }

  githubUrl.hash = "";

  if (githubUrl.pathname.length > 1) {
    githubUrl.pathname = githubUrl.pathname.replace(/\/+$/, "");
  }

  return githubUrl.toString();
}

export function normalizeGithubUrlFromDownloadUrl(
  downloadUrl: string,
): GithubNormalizationResult {
  let parsedDownloadUrl: URL;

  try {
    parsedDownloadUrl = new URL(downloadUrl);
  } catch {
    return {
      ok: false,
      status: "invalid_input",
      errorCode: "INVALID_DOWNLOAD_URL",
      errorMessage: "download 位置不是有效網址。",
    };
  }

  const encodedTarget = parsedDownloadUrl.searchParams.get("url");

  if (!encodedTarget) {
    return {
      ok: false,
      status: "invalid_input",
      errorCode: "MISSING_DOWNLOAD_TARGET",
      errorMessage: "download 位置缺少來源參數。",
    };
  }

  try {
    const normalizedGithubUrl = normalizeGithubTarget(encodedTarget);

    if (!normalizedGithubUrl) {
      return {
        ok: false,
        status: "non_github_source",
        errorCode: "NON_GITHUB_SOURCE",
        errorMessage: "解析出的來源不是 GitHub 連結。",
      };
    }

    return {
      ok: true,
      githubUrl: normalizedGithubUrl,
    };
  } catch {
    return {
      ok: false,
      status: "invalid_input",
      errorCode: "INVALID_DOWNLOAD_TARGET",
      errorMessage: "download 位置內的來源參數無法解讀。",
    };
  }
}
