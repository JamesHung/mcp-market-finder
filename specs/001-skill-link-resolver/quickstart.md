# Quickstart: MCP Skill 連結解析與查詢紀錄

## Prerequisites

- Node.js 22.12+。
- npm 10+。
- 可連線的 PostgreSQL 16+ 資料庫。

## Environment Variables

建立 `.env`（或對應的 local env 檔）並至少提供以下設定：

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mcp_market_finder
API_PORT=8787
MCPMARKET_BASE_URL=https://mcpmarket.com
```

說明：

- `DATABASE_URL`: 供 API 讀寫查詢紀錄。
- `API_PORT`: 本地 API 服務埠。
- `MCPMARKET_BASE_URL`: 預設上游來源，方便測試或未來替換。

## Expected Commands

以下命令定義本 feature 實作完成後的預期開發流程：

```bash
npm install
npm run lint
npm run db:migrate
npm run dev
npm run test
npm run build
```

## Local Run Flow

1. 確認 PostgreSQL 可連線，並建立空資料庫。
2. 執行 `npm install` 安裝前後端共用相依。
3. 執行 `npm run db:migrate` 建立 `lookup_records` schema。
4. 執行 `npm run dev` 啟動 Vite 前端與 Express API。
5. 於瀏覽器開啟 `http://localhost:5173`。

## Manual MVP Validation

手動驗證 UI 時，依目前專案規範應優先使用 Chrome MCP。

### 1. 解析 skill 詳情頁 URL

1. 貼上類似 `https://mcpmarket.com/zh/tools/skills/react-code-fix-linter`
   的 URL。
2. 確認畫面顯示 download 位置、GitHub 真實連結、查詢狀態與查詢時間。
3. 點擊 GitHub 真實連結，確認可開啟對應 repository path。

### 2. 解析 download API URL

1. 貼上類似
   `https://mcpmarket.com/api/skills/download?url=...` 的 URL。
2. 確認不需再次抓 skill 頁面也能完成 GitHub 真實連結轉換。

### 3. 驗證錯誤流程

1. 輸入非 `mcpmarket.com` URL。
2. 輸入格式正確但沒有可用來源位置的受支援 URL。
3. 確認系統顯示可恢復的錯誤訊息，且不把失敗紀錄顯示為成功結果。

### 4. 驗證歷史列表、搜尋與分頁

1. 建立至少 12 筆成功解析紀錄與至少 2 筆失敗紀錄。
2. 開啟歷史列表，確認只顯示成功解析紀錄，且第一頁僅顯示 10 筆。
3. 切換到第二頁，確認排序仍為最新到最舊。
4. 輸入搜尋文字，確認結果縮小且回到第一頁。
5. 搜尋無結果時，確認出現空狀態提示。

## Automated Validation Targets

- `npm run lint`: 型別、語法與可維護性規則。
- `npm run test`: parser / repository / API / React 畫面互動測試。
- `npm run build`: 前後端產物皆能成功建置。
