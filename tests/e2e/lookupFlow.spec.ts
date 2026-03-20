import { expect, test } from "@playwright/test";
import {
  blockedSkillPageUrl,
  downloadUrl,
  githubUrl,
  skillPageUrl,
} from "./fixtures";

test.beforeEach(async ({ request }) => {
  await request.post("/__e2e__/reset");
});

test("resolves a skill page URL and appends the success record to history", async ({
  page,
}) => {
  await page.goto("/");

  await expect(page.getByText("尚無成功紀錄")).toBeVisible();

  await page
    .getByLabel("輸入 MCP Market skill 詳情頁或 download URL")
    .fill(skillPageUrl);
  await page.getByRole("button", { name: "開始解析" }).click();

  const resultCard = page.locator("article.result-card");
  await expect(resultCard.getByRole("heading", { name: "解析完成" })).toBeVisible();
  await expect(resultCard.getByRole("link", { name: skillPageUrl })).toHaveAttribute(
    "href",
    skillPageUrl,
  );
  await expect(resultCard.getByRole("link", { name: downloadUrl })).toHaveAttribute(
    "href",
    downloadUrl,
  );
  await expect(resultCard.getByRole("link", { name: githubUrl })).toHaveAttribute(
    "href",
    githubUrl,
  );

  const historyList = page.locator("ul.history-list");
  await expect(historyList.locator(".history-item__title")).toHaveText(
    "react-code-fix-linter",
  );
  await expect(historyList.getByRole("link", { name: githubUrl })).toHaveAttribute(
    "href",
    githubUrl,
  );
});

test("shows an actionable error when the upstream skill page cannot be fetched", async ({
  page,
}) => {
  await page.goto("/");

  await page
    .getByLabel("輸入 MCP Market skill 詳情頁或 download URL")
    .fill(blockedSkillPageUrl);
  await page.getByRole("button", { name: "開始解析" }).click();

  await expect(page.getByText("這次沒有成功解析")).toBeVisible();
  await expect(page.getByText("目前無法讀取 skill 頁面，請稍後再試。")).toBeVisible();
  await expect(page.getByText("尚無成功紀錄")).toBeVisible();
  await expect(page.locator("ul.history-list")).toHaveCount(0);
});
