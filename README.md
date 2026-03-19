# MCP Market Finder

將 `mcpmarket.com` 的 skill 詳情頁或 download URL 轉成可直接開啟的 GitHub 真實連結，並保存成功查詢紀錄供搜尋與分頁瀏覽。

## Requirements

- Node.js 22.12+
- npm 10+
- PostgreSQL 16+

## Environment Variables

本專案可直接使用預設值；若要自訂，請建立 `.env` 並設定：

```env
DATABASE_URL=postgres://postgres:postgres@localhost:5432/mcp_market_finder
API_PORT=8787
MCPMARKET_BASE_URL=https://mcpmarket.com
```

## Quick Start

推薦直接用 `Makefile`：

```bash
make setup
make dev
```

如果你想手動執行，順序如下。

1. 安裝相依：

```bash
npm install
```

2. 準備 PostgreSQL，並建立 `mcp_market_finder` 資料庫。

3. 執行 migration：

```bash
npm run db:migrate
```

4. 啟動前後端開發模式：

```bash
npm run dev
```

5. 開啟：

- Frontend: `http://localhost:5173`
- API health: `http://localhost:8787/api/health`

## Use Docker For PostgreSQL

如果你只想快速起本機資料庫，可以用：

```bash
docker run -d --name mcp-market-finder-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=mcp_market_finder \
  -p 5432:5432 \
  postgres:16
```

停止並刪除：

```bash
docker rm -f mcp-market-finder-postgres
```

也可以直接用：

```bash
make postgres-up
make postgres-down
```

## Test And Build

建議順序：

```bash
make lint
make test
make build
```

各指令用途：

- `npm run lint`: ESLint 檢查
- `npm run test`: Vitest 測試
- `npm run build`: 建置前端與後端產物
- `npm run dev`: 啟動 Vite + Express 開發環境
- `npm run db:migrate`: 建立 `lookup_records` schema

對應的 `make` 入口：

- `make setup`: 安裝相依、啟動本機 PostgreSQL、執行 migration
- `make dev`: 啟動開發環境
- `make verify`: 依序執行 lint、test、build

## Manual Verification

1. 輸入 skill 詳情頁 URL，例如：
   `https://mcpmarket.com/zh/tools/skills/react-code-fix-linter`
2. 或輸入 download API URL，例如：
   `https://mcpmarket.com/api/skills/download?url=...`
3. 確認畫面顯示：
   - 原始輸入
   - download 位置
   - GitHub 真實連結
   - 查詢時間
4. 檢查歷史列表：
   - 只顯示成功紀錄
   - 每頁 10 筆
   - 搜尋後會回到第 1 頁

## Notes

- 歷史列表只顯示成功解析紀錄。
- 若上游 `mcpmarket.com` 對 server-side 抓頁啟用防護，skill 詳情頁解析可能受阻；此時可先用 download API URL 驗證主要流程。
