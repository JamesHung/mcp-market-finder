# Research: MCP Skill 連結解析與查詢紀錄

## Decision 1: 採用 React SPA + Express API 的最小全端架構

- **Decision**: 使用 React 19 + Vite 7 建立單頁前端，搭配 Express 5 提供同源
  REST API，所有 PostgreSQL 與外部頁面解析工作都在伺服器端完成。
- **Rationale**: 使用者明確要求 PostgreSQL 與共享歷史紀錄，代表瀏覽器端
  storage 不足以滿足需求。最小 Node API 能保護資料庫連線資訊、集中處理
  `mcpmarket.com` 抓取與 HTML 解析、並讓前端維持簡單的 UI/data-fetching
  邊界。
- **Alternatives considered**:
  - Browser-only + localStorage: 無法提供共享歷史與 PostgreSQL。
  - Next.js full-stack: 超出憲章的 Vite 預設與 MVP 所需複雜度。
  - Serverless/edge scraping flow: 對目前單頁 MVP 沒有明顯收益。

## Decision 2: 使用 React 19、Vite 7 與 Node.js 22.12+

- **Decision**: 技術基線採用 React 19.x、Vite 7.x、Node.js 22.12+。
- **Rationale**: React 19 已正式穩定；Vite 7 是目前正式主線，且官方說明要求
  Node.js 20.19+ 或 22.12+；Node 官方建議正式環境只使用 Active LTS 或
  Maintenance LTS 版本，22.x 仍在 LTS 生命週期內，能兼顧穩定與相容性。
- **Alternatives considered**:
  - Node.js 20.x: 也可行，但沒有比 22.12+ 更有優勢。
  - Node.js 24.x: 生命週期更長，但 Vite 7 文件明確列出的是 20.19+ / 22.12+。
  - React Router / SSR: 本功能只有單一主頁，不需要額外 routing 依賴。

## Decision 3: PostgreSQL 以單表 `lookup_records` 為核心，使用 `pg.Pool`

- **Decision**: 以單一 `lookup_records` 表保存所有查詢紀錄，透過
  node-postgres 的 `Pool` 與參數化 SQL 操作 PostgreSQL。
- **Rationale**: `pg.Pool` 是 node-postgres 官方建議的常態用法，可避免每次
  請求都建立新連線；參數化 query 可直接降低 SQL injection 風險。歷史列表只
  顯示成功紀錄，因此以 `status = success` 搭配固定排序與分頁即可滿足 MVP。
  PostgreSQL 文件也指出 `LIMIT/OFFSET` 必須配合穩定 `ORDER BY`，否則結果
  子集不可預期。
- **Alternatives considered**:
  - ORM / query builder: 對單表 MVP 增加依賴與抽象層，收益不足。
  - 成功/失敗拆成兩張表: 使寫入與查詢複雜化，沒有必要。
  - 一開始就採 keyset pagination: 目前固定 10 筆頁面與中小型資料量不需要。

## Decision 4: Skill 詳情頁解析使用 Cheerio，而不是 regex 或完整 DOM 模擬

- **Decision**: 對 skill 詳情頁 HTML 採用 Cheerio 1.1.x 解析 download button
  或等效連結資訊。
- **Rationale**: 需要從實際 HTML 結構穩定擷取下載連結時，regex 對標記變動
  太脆弱；Cheerio 提供 server-side CSS selector API，足以完成這個 MVP，
  又比完整 DOM 模擬更輕量。對 download API URL 則不需抓頁，直接解析 query
  string 並正規化 GitHub 來源。
- **Alternatives considered**:
  - Regex only: 對 HTML 結構變化容錯太差。
  - JSDOM: 功能過剩且成本更高。
  - Headless browser scraping: 對目前公開靜態內容過於昂貴。

## Decision 5: 對外介面採最小 REST JSON 合約

- **Decision**: 只暴露兩個對外端點：
  `POST /api/lookups/resolve` 與 `GET /api/history`。
- **Rationale**: 這兩個端點剛好對應 spec 的兩個主要可驗證使用者流程：
  解析單一輸入，以及檢視/搜尋成功歷史。保持 API 面積小，可降低前後端與測試
  的同步成本。
- **Alternatives considered**:
  - GraphQL: 沒有多資源查詢需求。
  - RPC-style 多動作端點: 可讀性與合約清晰度較差。
  - 直接從前端存取資料庫: 不可行，也違反安全邊界。

## Decision 6: 測試策略採「自動化核心流程 + 可重複手動驗證」

- **Decision**: 使用 Vitest 3.2+ 做 shared utility / parser / repository /
  API handler 測試，搭配 React Testing Library 驗證主要畫面行為，E2E 先以
  quickstart 內定義的手動驗證腳本完成。
- **Rationale**: 此功能是 MVP，而且 repo 尚未存在既有測試框架。先把最容易
  回歸的 URL 解析、錯誤處理、搜尋/分頁條件與主要畫面互動自動化，能在不過度
  增加工具負擔的前提下滿足憲章的 testable delivery 要求。
- **Alternatives considered**:
  - 只做手動驗證: 對解析與分頁邏輯風險過高。
  - 一開始就導入 Playwright E2E: 對空 repo 的首版 MVP 成本偏高，可在
    tasks/implementation 階段視情況補強。

## Source Notes

- React 19 已穩定發布：<https://react.dev/blog/2024/12/05/react-19>
- Vite 7 正式發布，且要求 Node.js 20.19+ 或 22.12+：<https://vite.dev/blog/announcing-vite7>
- Node.js 正式環境應使用 Active LTS 或 Maintenance LTS：<https://nodejs.org/en/about/previous-releases>
- Express 5 需 Node.js 18 以上：<https://expressjs.com/en/guide/migrating-5.html>
- node-postgres 建議 web app 使用 connection pool，並使用參數化 query：<https://node-postgres.com/features/pooling>, <https://node-postgres.com/features/queries>
- PostgreSQL `LIMIT/OFFSET` 需要穩定排序；索引需審慎使用，B-tree 適合常見排序與比較查詢：<https://www.postgresql.org/docs/current/queries-limit.html>, <https://www.postgresql.org/docs/current/indexes.html>, <https://www.postgresql.org/docs/current/indexes-types.html>
- Cheerio 適合在 Node 端載入與選取 HTML 結構：<https://cheerio.js.org/docs/basics/selecting>, <https://github.com/cheeriojs/cheerio/releases>
