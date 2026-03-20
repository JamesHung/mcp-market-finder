export const HISTORY_PAGE_SIZE = 10;

export type InputType = "skill_page" | "download_api";

export type LookupStatus =
  | "success"
  | "invalid_input"
  | "unsupported_input"
  | "missing_source"
  | "upstream_error"
  | "non_github_source";

export interface LookupRecord {
  id: number;
  inputUrl: string;
  normalizedInputUrl: string;
  inputType: InputType;
  skillSlug: string | null;
  downloadUrl: string | null;
  githubUrl: string | null;
  status: LookupStatus;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export interface HistoryRecord {
  id: number;
  inputUrl: string;
  inputType: InputType;
  skillSlug: string | null;
  downloadUrl: string;
  githubUrl: string;
  createdAt: string;
}

export interface LookupSubmission {
  url: string;
}

export interface HistoryQuery {
  page: number;
  q?: string;
}

export interface ResolveLookupSuccessResponse {
  record: LookupRecord & {
    status: "success";
    downloadUrl: string;
    githubUrl: string;
  };
}

export interface ResolveLookupFailureResponse {
  record: LookupRecord;
  error: {
    code: string;
    message: string;
  };
}

export interface HistoryListResponse {
  items: HistoryRecord[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
