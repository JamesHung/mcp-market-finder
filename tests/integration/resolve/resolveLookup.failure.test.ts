// @vitest-environment jsdom
import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomePage } from "../../../src/client/pages/HomePage";

function jsonResponse(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("resolve failure flow", () => {
  it("shows recoverable error feedback for unsupported sources", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation((input, init) => {
      const url = String(input);

      if (url.endsWith("/api/history?page=1")) {
        return Promise.resolve(
          jsonResponse(
            {
              items: [],
              page: 1,
              pageSize: 10,
              totalItems: 0,
              totalPages: 0,
              hasNextPage: false,
              hasPreviousPage: false,
            },
            200,
          ),
        );
      }

      if (url.endsWith("/api/lookups/resolve") && init?.method === "POST") {
        return Promise.resolve(
          jsonResponse(
            {
              record: {
                id: 99,
                inputUrl:
                  "https://mcpmarket.com/api/skills/download?url=https%3A%2F%2Fgitlab.com%2Fgroup%2Frepo",
                normalizedInputUrl:
                  "https://mcpmarket.com/api/skills/download?url=https%3A%2F%2Fgitlab.com%2Fgroup%2Frepo",
                inputType: "download_api",
                skillSlug: null,
                downloadUrl:
                  "https://mcpmarket.com/api/skills/download?url=https%3A%2F%2Fgitlab.com%2Fgroup%2Frepo",
                githubUrl: null,
                status: "non_github_source",
                errorCode: "NON_GITHUB_SOURCE",
                errorMessage: "解析出的來源不是 GitHub 連結。",
                createdAt: new Date("2026-03-19T00:00:00.000Z").toISOString(),
              },
              error: {
                code: "NON_GITHUB_SOURCE",
                message: "解析出的來源不是 GitHub 連結。",
              },
            },
            422,
          ),
        );
      }

      return Promise.reject(new Error(`Unexpected request: ${url}`));
    });

    render(React.createElement(HomePage));

    fireEvent.change(
      screen.getByLabelText("輸入 MCP Market skill 詳情頁或 download URL"),
      {
        target: {
          value:
            "https://mcpmarket.com/api/skills/download?url=https%3A%2F%2Fgitlab.com%2Fgroup%2Frepo",
        },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "開始解析" }));

    expect(await screen.findByText("這次沒有成功解析")).toBeInTheDocument();
    expect(screen.getByText("解析出的來源不是 GitHub 連結。")).toBeInTheDocument();
  });
});
