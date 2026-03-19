import { HISTORY_PAGE_SIZE } from "../../shared/types/lookup";
import type {
  HistoryListResponse,
  HistoryQuery,
  HistoryRecord,
  InputType,
  LookupRecord,
  LookupStatus,
} from "../../shared/types/lookup";
import type { Queryable } from "../db/pool";

interface LookupRecordRow {
  id: number;
  input_url: string;
  normalized_input_url: string;
  input_type: InputType;
  skill_slug: string | null;
  download_url: string | null;
  github_url: string | null;
  status: LookupStatus;
  error_code: string | null;
  error_message: string | null;
  created_at: Date | string;
}

interface CountRow {
  count: string;
}

export interface LookupRecordInsert {
  inputUrl: string;
  normalizedInputUrl: string;
  inputType: InputType;
  skillSlug: string | null;
  downloadUrl: string | null;
  githubUrl: string | null;
  status: LookupStatus;
  errorCode: string | null;
  errorMessage: string | null;
}

export interface LookupRepositoryLike {
  saveRecord(record: LookupRecordInsert): Promise<LookupRecord>;
  listHistory(query: HistoryQuery): Promise<HistoryListResponse>;
}

export interface NormalizedHistoryQuery {
  page: number;
  searchTerm: string | null;
  limit: number;
  offset: number;
}

function toIsoString(value: Date | string) {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapLookupRecord(row: LookupRecordRow): LookupRecord {
  return {
    id: row.id,
    inputUrl: row.input_url,
    normalizedInputUrl: row.normalized_input_url,
    inputType: row.input_type,
    skillSlug: row.skill_slug,
    downloadUrl: row.download_url,
    githubUrl: row.github_url,
    status: row.status,
    errorCode: row.error_code,
    errorMessage: row.error_message,
    createdAt: toIsoString(row.created_at),
  };
}

function mapHistoryRecord(row: LookupRecordRow): HistoryRecord {
  return {
    id: row.id,
    inputUrl: row.input_url,
    inputType: row.input_type,
    skillSlug: row.skill_slug,
    downloadUrl: row.download_url ?? "",
    githubUrl: row.github_url ?? "",
    createdAt: toIsoString(row.created_at),
  };
}

export function normalizeHistoryQuery(query: HistoryQuery): NormalizedHistoryQuery {
  const pageValue = Number(query.page);
  const page = Number.isInteger(pageValue) && pageValue > 0 ? pageValue : 1;
  const searchTerm = query.q?.trim() ? query.q.trim() : null;

  return {
    page,
    searchTerm,
    limit: HISTORY_PAGE_SIZE,
    offset: (page - 1) * HISTORY_PAGE_SIZE,
  };
}

export function buildHistoryWhereClause(searchTerm: string | null) {
  const params: unknown[] = ["success"];
  let clause = "status = $1 AND download_url IS NOT NULL AND github_url IS NOT NULL";

  if (searchTerm) {
    params.push(`%${searchTerm}%`);
    clause += `
      AND (
        input_url ILIKE $2
        OR COALESCE(download_url, '') ILIKE $2
        OR COALESCE(github_url, '') ILIKE $2
        OR COALESCE(skill_slug, '') ILIKE $2
      )
    `;
  }

  return { clause, params };
}

export class LookupRepository implements LookupRepositoryLike {
  constructor(private readonly db: Queryable) {}

  async saveRecord(record: LookupRecordInsert) {
    const result = await this.db.query<LookupRecordRow>(
      `
        INSERT INTO lookup_records (
          input_url,
          normalized_input_url,
          input_type,
          skill_slug,
          download_url,
          github_url,
          status,
          error_code,
          error_message
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING
          id,
          input_url,
          normalized_input_url,
          input_type,
          skill_slug,
          download_url,
          github_url,
          status,
          error_code,
          error_message,
          created_at
      `,
      [
        record.inputUrl,
        record.normalizedInputUrl,
        record.inputType,
        record.skillSlug,
        record.downloadUrl,
        record.githubUrl,
        record.status,
        record.errorCode,
        record.errorMessage,
      ],
    );

    return mapLookupRecord(result.rows[0]);
  }

  async listHistory(query: HistoryQuery) {
    const normalizedQuery = normalizeHistoryQuery(query);
    const filters = buildHistoryWhereClause(normalizedQuery.searchTerm);
    const countResult = await this.db.query<CountRow>(
      `SELECT COUNT(*)::text AS count FROM lookup_records WHERE ${filters.clause}`,
      filters.params,
    );
    const totalItems = Number(countResult.rows[0]?.count ?? 0);
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / normalizedQuery.limit);
    const itemParams = [...filters.params, normalizedQuery.limit, normalizedQuery.offset];
    const limitPosition = filters.params.length + 1;
    const offsetPosition = filters.params.length + 2;
    const itemsResult = await this.db.query<LookupRecordRow>(
      `
        SELECT
          id,
          input_url,
          normalized_input_url,
          input_type,
          skill_slug,
          download_url,
          github_url,
          status,
          error_code,
          error_message,
          created_at
        FROM lookup_records
        WHERE ${filters.clause}
        ORDER BY created_at DESC, id DESC
        LIMIT $${limitPosition}
        OFFSET $${offsetPosition}
      `,
      itemParams,
    );

    return {
      items: itemsResult.rows.map(mapHistoryRecord),
      page: normalizedQuery.page,
      pageSize: normalizedQuery.limit,
      totalItems,
      totalPages,
      hasNextPage:
        totalPages > 0 ? normalizedQuery.page < totalPages : false,
      hasPreviousPage: normalizedQuery.page > 1 && totalItems > 0,
    } satisfies HistoryListResponse;
  }
}
