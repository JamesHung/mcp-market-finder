import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../../../src/server/app";
import type { LookupServiceContract } from "../../../src/server/services/lookupService";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("app error handling", () => {
  it("returns a specific 503 response when the database is unavailable", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const lookupService: LookupServiceContract = {
      resolve: async () => {
        const error = new AggregateError([
          Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:5432"), {
            code: "ECONNREFUSED",
          }),
        ]);
        throw error;
      },
      listHistory: async () => ({
        items: [],
        page: 1,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }),
    };

    const app = createApp(lookupService);
    const response = await request(app)
      .post("/api/lookups/resolve")
      .send({
        url: "https://mcpmarket.com/zh/tools/skills/react-code-fix-linter",
      });

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "資料庫目前無法使用，請先啟動 PostgreSQL 並執行 migration。",
      },
    });
    expect(consoleError).toHaveBeenCalledWith(
      "Request failed",
      expect.objectContaining({
        method: "POST",
        path: "/api/lookups/resolve",
        error: expect.objectContaining({
          name: "AggregateError",
        }),
      }),
    );
  });
});
