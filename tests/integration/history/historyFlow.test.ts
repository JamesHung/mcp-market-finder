// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "../../../src/client/pages/HomePage";

function createHistoryItem(id: number, name: string) {
  return {
    id,
    inputUrl: `https://mcpmarket.com/zh/tools/skills/${name}`,
    inputType: "skill_page" as const,
    skillSlug: name,
    downloadUrl: `https://mcpmarket.com/api/skills/download?url=https%3A%2F%2Fgithub.com%2Fdemo%2F${name}`,
    githubUrl: `https://github.com/demo/${name}`,
    createdAt: new Date(Date.UTC(2026, 2, 19, 0, 0, id)).toISOString(),
  };
}

function jsonResponse(payload: unknown) {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      "content-type": "application/json",
    },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("history flow", () => {
  it("loads success-only history, supports search, and paginates 10 items per page", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockImplementation((input) => {
      const url = String(input);

      if (url.endsWith("/api/history?page=1")) {
        return Promise.resolve(
          jsonResponse({
            items: Array.from({ length: 10 }, (_, index) =>
              createHistoryItem(index + 1, `skill-${index + 1}`),
            ),
            page: 1,
            pageSize: 10,
            totalItems: 12,
            totalPages: 2,
            hasNextPage: true,
            hasPreviousPage: false,
          }),
        );
      }

      if (url.endsWith("/api/history?page=1&q=react")) {
        return Promise.resolve(
          jsonResponse({
            items: [createHistoryItem(101, "react-code-fix-linter")],
            page: 1,
            pageSize: 10,
            totalItems: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          }),
        );
      }

      if (url.endsWith("/api/history?page=2")) {
        return Promise.resolve(
          jsonResponse({
            items: [createHistoryItem(11, "skill-11"), createHistoryItem(12, "skill-12")],
            page: 2,
            pageSize: 10,
            totalItems: 12,
            totalPages: 2,
            hasNextPage: false,
            hasPreviousPage: true,
          }),
        );
      }

      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    render(React.createElement(HomePage));

    expect(await screen.findByText("skill-1")).toBeInTheDocument();
    expect(screen.getByText("第 1 頁 / 2 頁")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "下一頁" }));

    expect(await screen.findByText("skill-11")).toBeInTheDocument();
    expect(screen.getByText("第 2 頁 / 2 頁")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("搜尋歷史紀錄"), {
      target: { value: "react" },
    });
    fireEvent.click(screen.getByRole("button", { name: "搜尋" }));

    expect(await screen.findByText("react-code-fix-linter")).toBeInTheDocument();
    expect(screen.getByText("第 1 頁 / 1 頁")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
