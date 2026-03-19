import { LOOKUP_CONSTRAINTS } from "../../shared/contracts/lookup";
import type {
  HistoryListResponse,
  LookupSubmission,
  ResolveLookupFailureResponse,
  ResolveLookupSuccessResponse,
} from "../../shared/types/lookup";
import { ApiError, requestJson } from "./api";

export type ResolveLookupResponse =
  | ResolveLookupSuccessResponse
  | ResolveLookupFailureResponse;

export function validateLookupUrl(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return "請輸入 mcpmarket.com 的 skill 頁面或 download URL。";
  }

  try {
    const parsed = new URL(trimmed);

    if (!LOOKUP_CONSTRAINTS.supportedHostnames.includes(parsed.hostname as never)) {
      return "只支援 mcpmarket.com 的 skill 頁面或 download URL。";
    }
  } catch {
    return "輸入內容不是有效的絕對網址。";
  }

  return null;
}

export async function resolveLookup(submission: LookupSubmission) {
  try {
    return await requestJson<ResolveLookupSuccessResponse>(
      "/api/lookups/resolve",
      {
        method: "POST",
        body: JSON.stringify(submission),
      },
    );
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.payload &&
      typeof error.payload === "object"
    ) {
      return error.payload as ResolveLookupFailureResponse;
    }

    throw error;
  }
}

export function buildHistoryQueryString(page: number, query: string) {
  const params = new URLSearchParams();
  params.set("page", String(page));

  if (query.trim()) {
    params.set("q", query.trim());
  }

  return params.toString();
}

export async function fetchHistory(page: number, query: string) {
  const queryString = buildHistoryQueryString(page, query);

  return requestJson<HistoryListResponse>(`/api/history?${queryString}`);
}
