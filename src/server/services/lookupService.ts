import type {
  HistoryListResponse,
  HistoryQuery,
  LookupSubmission,
  ResolveLookupFailureResponse,
  ResolveLookupSuccessResponse,
} from "../../shared/types/lookup";
import {
  extractDownloadUrlFromHtml,
  normalizeGithubUrlFromDownloadUrl,
  parseMcpMarketInput,
} from "../parsers/mcpMarketParser";
import type { LookupRecordInsert, LookupRepositoryLike } from "../repositories/lookupRepository";
import type { SkillPageFetcher } from "./mcpMarketFetcher";

export interface LookupServiceContract {
  resolve(
    submission: LookupSubmission,
  ): Promise<ResolveLookupSuccessResponse | ResolveLookupFailureResponse>;
  listHistory(query: HistoryQuery): Promise<HistoryListResponse>;
}

export class LookupService implements LookupServiceContract {
  constructor(
    private readonly repository: LookupRepositoryLike,
    private readonly skillPageFetcher: SkillPageFetcher,
  ) {}

  async resolve(
    submission: LookupSubmission,
  ): Promise<ResolveLookupSuccessResponse | ResolveLookupFailureResponse> {
    const parsedInput = parseMcpMarketInput(submission.url);

    if (!parsedInput.ok) {
      return this.persistFailure({
        inputUrl: parsedInput.inputUrl,
        normalizedInputUrl: parsedInput.normalizedInputUrl,
        inputType: parsedInput.inputType,
        skillSlug: null,
        downloadUrl: null,
        githubUrl: null,
        status: parsedInput.status,
        errorCode: parsedInput.errorCode,
        errorMessage: parsedInput.errorMessage,
      });
    }

    const lookup = parsedInput.value;
    let downloadUrl = lookup.downloadUrl;

    if (lookup.inputType === "skill_page") {
      try {
        const html = await this.skillPageFetcher.fetchSkillPageHtml(
          lookup.normalizedInputUrl,
        );
        downloadUrl = extractDownloadUrlFromHtml(html, lookup.normalizedInputUrl);
      } catch {
        return this.persistFailure({
          inputUrl: lookup.inputUrl,
          normalizedInputUrl: lookup.normalizedInputUrl,
          inputType: lookup.inputType,
          skillSlug: lookup.skillSlug,
          downloadUrl: null,
          githubUrl: null,
          status: "upstream_error",
          errorCode: "UPSTREAM_UNAVAILABLE",
          errorMessage: "目前無法讀取 skill 頁面，請稍後再試。",
        });
      }
    }

    if (!downloadUrl) {
      return this.persistFailure({
        inputUrl: lookup.inputUrl,
        normalizedInputUrl: lookup.normalizedInputUrl,
        inputType: lookup.inputType,
        skillSlug: lookup.skillSlug,
        downloadUrl: null,
        githubUrl: null,
        status: "missing_source",
        errorCode: "MISSING_DOWNLOAD_URL",
        errorMessage: "找不到可用的 download 位置。",
      });
    }

    const normalizedGithub = normalizeGithubUrlFromDownloadUrl(downloadUrl);

    if (!normalizedGithub.ok) {
      return this.persistFailure({
        inputUrl: lookup.inputUrl,
        normalizedInputUrl: lookup.normalizedInputUrl,
        inputType: lookup.inputType,
        skillSlug: lookup.skillSlug,
        downloadUrl,
        githubUrl: null,
        status: normalizedGithub.status,
        errorCode: normalizedGithub.errorCode,
        errorMessage: normalizedGithub.errorMessage,
      });
    }

    const record = await this.repository.saveRecord({
      inputUrl: lookup.inputUrl,
      normalizedInputUrl: lookup.normalizedInputUrl,
      inputType: lookup.inputType,
      skillSlug: lookup.skillSlug,
      downloadUrl,
      githubUrl: normalizedGithub.githubUrl,
      status: "success",
      errorCode: null,
      errorMessage: null,
    });

    return {
      record: {
        ...record,
        status: "success",
        downloadUrl,
        githubUrl: normalizedGithub.githubUrl,
      },
    };
  }

  listHistory(query: HistoryQuery) {
    return this.repository.listHistory(query);
  }

  private async persistFailure(
    failure: LookupRecordInsert,
  ): Promise<ResolveLookupFailureResponse> {
    const record = await this.repository.saveRecord(failure);

    return {
      record,
      error: {
        code: failure.errorCode ?? "UNKNOWN_ERROR",
        message: failure.errorMessage ?? "查詢失敗。",
      },
    };
  }
}
