import { normalizeHistoryQuery, type LookupRecordInsert, type LookupRepositoryLike } from "../../src/server/repositories/lookupRepository";
import type {
  HistoryListResponse,
  HistoryQuery,
  LookupRecord,
} from "../../src/shared/types/lookup";

export class InMemoryLookupRepository implements LookupRepositoryLike {
  private sequence = 1;
  private readonly records: LookupRecord[] = [];

  async saveRecord(record: LookupRecordInsert) {
    const saved: LookupRecord = {
      id: this.sequence++,
      inputUrl: record.inputUrl,
      normalizedInputUrl: record.normalizedInputUrl,
      inputType: record.inputType,
      skillSlug: record.skillSlug,
      downloadUrl: record.downloadUrl,
      githubUrl: record.githubUrl,
      status: record.status,
      errorCode: record.errorCode,
      errorMessage: record.errorMessage,
      createdAt: new Date(Date.UTC(2026, 2, 19, 2, 0, this.sequence)).toISOString(),
    };

    this.records.unshift(saved);

    return saved;
  }

  async listHistory(query: HistoryQuery) {
    const normalized = normalizeHistoryQuery(query);
    const searchTerm = normalized.searchTerm?.toLowerCase() ?? null;
    const matching = this.records.filter((record) => {
      if (record.status !== "success" || !record.downloadUrl || !record.githubUrl) {
        return false;
      }

      if (!searchTerm) {
        return true;
      }

      return [
        record.inputUrl,
        record.downloadUrl,
        record.githubUrl,
        record.skillSlug ?? "",
      ].some((value) => value.toLowerCase().includes(searchTerm));
    });
    const paged = matching.slice(
      normalized.offset,
      normalized.offset + normalized.limit,
    );
    const totalPages =
      matching.length === 0 ? 0 : Math.ceil(matching.length / normalized.limit);

    return {
      items: paged.map((record) => ({
        id: record.id,
        inputUrl: record.inputUrl,
        inputType: record.inputType,
        skillSlug: record.skillSlug,
        downloadUrl: record.downloadUrl ?? "",
        githubUrl: record.githubUrl ?? "",
        createdAt: record.createdAt,
      })),
      page: normalized.page,
      pageSize: normalized.limit,
      totalItems: matching.length,
      totalPages,
      hasNextPage: totalPages > 0 ? normalized.page < totalPages : false,
      hasPreviousPage: normalized.page > 1 && matching.length > 0,
    } satisfies HistoryListResponse;
  }

  getRecords() {
    return [...this.records];
  }

  clear() {
    this.records.length = 0;
    this.sequence = 1;
  }
}
