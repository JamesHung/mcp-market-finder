import { describe, expect, it, vi } from "vitest";
import {
  LookupRepository,
  buildHistoryWhereClause,
  normalizeHistoryQuery,
} from "../../../src/server/repositories/lookupRepository";
import type { Queryable } from "../../../src/server/db/pool";

describe("lookupRepository history behavior", () => {
  it("normalizes page and search query values", () => {
    expect(normalizeHistoryQuery({ page: 0, q: "  React  " })).toEqual({
      page: 1,
      searchTerm: "React",
      limit: 10,
      offset: 0,
    });
  });

  it("builds success-only search filters", () => {
    const filters = buildHistoryWhereClause("react");

    expect(filters.clause).toContain("status = $1");
    expect(filters.clause).toContain("input_url ILIKE $2");
    expect(filters.params).toEqual(["success", "%react%"]);
  });

  it("returns paginated history metadata and rows", async () => {
    const db: Queryable = {
      query: vi
        .fn()
        .mockResolvedValueOnce({
          rows: [{ count: "12" }],
          rowCount: 1,
        })
        .mockResolvedValueOnce({
          rows: [
            {
              id: 12,
              input_url:
                "https://mcpmarket.com/zh/tools/skills/react-code-fix-linter",
              normalized_input_url:
                "https://mcpmarket.com/zh/tools/skills/react-code-fix-linter",
              input_type: "skill_page",
              skill_slug: "react-code-fix-linter",
              download_url:
                "https://mcpmarket.com/api/skills/download?url=https%3A%2F%2Fgithub.com%2Ffacebook%2Freact%2Ftree%2Fmain",
              github_url: "https://github.com/facebook/react/tree/main",
              status: "success",
              error_code: null,
              error_message: null,
              created_at: new Date("2026-03-19T00:00:00.000Z"),
            },
          ],
          rowCount: 1,
        }),
    };
    const repository = new LookupRepository(db);

    const result = await repository.listHistory({ page: 2, q: "React" });

    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(10);
    expect(result.totalItems).toBe(12);
    expect(result.totalPages).toBe(2);
    expect(result.hasNextPage).toBe(false);
    expect(result.hasPreviousPage).toBe(true);
    expect(result.items[0]?.githubUrl).toBe(
      "https://github.com/facebook/react/tree/main",
    );
    expect(db.query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("COUNT(*)::text AS count"),
      ["success", "%React%"],
    );
    expect(db.query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("ORDER BY created_at DESC, id DESC"),
      ["success", "%React%", 10, 10],
    );
  });
});
