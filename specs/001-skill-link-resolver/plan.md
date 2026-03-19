# Implementation Plan: MCP Skill 連結解析與查詢紀錄

**Branch**: `[001-skill-link-resolver]` | **Date**: 2026-03-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-skill-link-resolver/spec.md`

**Note**: This template is filled by the spec-kit planning workflow.

## Summary

交付一個最小可用的全端網頁應用：使用者可輸入 `mcpmarket.com` 的 skill
詳情頁 URL 或 download API URL，由伺服器解析對應 download 位置並轉成可直接
開啟的 GitHub 真實連結，將每次查詢持久化到 PostgreSQL，並在前端提供只顯示
成功解析紀錄的歷史查詢、搜尋與每頁 10 筆的分頁列表。

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.x, Node.js 22.12+

**Build Tool**: Vite 7.x

**Primary Dependencies**: React 19, React DOM 19, Express 5, node-postgres (`pg`) 8.15+, Cheerio 1.1.x

**Data Source**: 同源 REST API；外部資料來自 `mcpmarket.com` 公開 skill 詳情頁與 download API URL

**Storage**: PostgreSQL 16+

**Testing**: Vitest 3.2+, React Testing Library, Node-based API integration tests, repeatable manual MVP validation

**Target Platform**: Modern desktop and mobile browsers

**Project Type**: Full-stack TypeScript web application (React SPA + minimal Node API)

**Performance Goals**: 單次解析請求在一般上游可用時達成 5 秒內回應；歷史列表查詢在 5,000 筆成功紀錄內維持 300ms 內回應；初始單一路由 bundle 目標低於 250 KB gzip

**Constraints**: 無登入、共享歷史列表、只支援 GitHub 來源、歷史列表只顯示成功紀錄、避免 ORM 與全域 state library、所有輸入與 SQL 必須參數化驗證

**Scale/Scope**: 1 個主頁面、2 個對外 API 端點、1 個主要資料表、單一共享資料集，MVP 目標為數千到數萬筆查詢紀錄

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Gate

- PASS: MVP 範圍明確，聚焦於 URL 解析、成功歷史列表、搜尋、分頁與錯誤處理，沒有額外帳號或批次匯入功能。
- PASS: 採用 React + TypeScript + Vite，並把 UI、client data fetching、server services、repository 分離；新增最小後端屬於規格明示的持久化需求，不是推測性擴充。
- PASS: 規格已要求桌機與行動裝置響應式、鍵盤操作、標示、焦點與載入/錯誤/空結果/成功狀態。
- PASS: 共享歷史、輸入格式、成功/失敗保存與歷史列表只顯示成功紀錄等資料契約已在 spec 中明確。
- PASS: 驗證策略將覆蓋主流程、失敗輸入、上游解析失敗、搜尋與分頁；E2E 先以可重複的 manual MVP 驗證補足。
- PASS: 新依賴限制在 React、Express、`pg`、Cheerio、Vitest/RTL；每項都有明確交付理由。
- PASS: 計畫文件、研究、資料模型、合約與 quickstart 皆以繁體中文撰寫。

### Post-Design Gate

- PASS: 設計維持單頁 React 前端 + 最小 Express API，沒有引入全域狀態庫、ORM 或 SSR 框架。
- PASS: `LookupRecord` 單表模型已可覆蓋成功/失敗保存、歷史可見性、搜尋與分頁需求，避免不必要的資料拆分。
- PASS: API 合約把使用者可見流程收斂為 `POST /api/lookups/resolve` 與 `GET /api/history` 兩個端點，符合 MVP。
- PASS: quickstart 定義了環境變數、開發啟動、migration、測試與手動驗證步驟，滿足可重複驗證要求。
- PASS: 分頁採用固定 10 筆與穩定排序，並以成功紀錄篩選與索引設計控制效能與可預期性。
- PASS: 沒有憲章違規事項需要例外處理。

## Project Structure

### Documentation (this feature)

```text
specs/001-skill-link-resolver/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── lookup-api.openapi.yaml
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── client/
│   ├── app/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── types/
│   └── utils/
├── server/
│   ├── api/
│   ├── db/
│   ├── parsers/
│   ├── repositories/
│   ├── services/
│   └── types/
└── shared/
    ├── contracts/
    └── types/

db/
└── migrations/

tests/
├── integration/
└── unit/

public/
```

**Structure Decision**: 採用單一 repo 的 `src/client` + `src/server` + `src/shared`
結構。前端保留 React/Vite 的簡潔邊界；後端僅保留解析、API、資料存取與 DB
設定；共用型別與 API schema 置於 `src/shared`，避免前後端契約漂移。

## Phase 0: Research Outcome

- 技術選型、Node/Vite/React 版本、HTML 解析策略、資料存取策略與測試策略已整理於 [research.md](./research.md)。
- 所有原本可能影響實作的技術未知項已收斂，無 `NEEDS CLARIFICATION` 殘留。

## Phase 1: Design Outcome

- 資料模型定義於 [data-model.md](./data-model.md)，以 `LookupRecord` 為核心 persisted entity。
- 對外介面合約定義於 [lookup-api.openapi.yaml](./contracts/lookup-api.openapi.yaml)。
- 本地啟動與驗證流程定義於 [quickstart.md](./quickstart.md)。

## Phase 2: Implementation Preview

1. 建立 Vite + React 前端、Express API、共享型別與 PostgreSQL migration 基礎骨架。
2. 實作 URL 驗證、外部解析服務、GitHub 真實連結正規化、查詢保存與結果 UI。
3. 實作成功歷史列表 API、搜尋/分頁 UI、空狀態與錯誤狀態，以及單元與整合驗證。

## Implementation Validation

- 2026-03-19 已完成 `npm run lint`、`npm test`、`npm run build` 驗證。
- UI 自動化以 Vitest + React Testing Library 覆蓋主要流程；若要追加手動驗證，依 repo 規範應優先使用 Chrome MCP。

## Complexity Tracking

目前沒有需要憲章例外的複雜度項目。
