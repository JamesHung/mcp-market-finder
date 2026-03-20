# Tasks: MCP Skill 連結解析與查詢紀錄

**Input**: Design documents from `/specs/001-skill-link-resolver/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [lookup-api.openapi.yaml](./contracts/lookup-api.openapi.yaml), [quickstart.md](./quickstart.md)

**Validation**: 本 feature 已在 `plan.md` 明確選擇 Vitest、React Testing Library
與可重複手動驗證，因此每個 user story 都包含自動化驗證任務，並保留
`quickstart.md` 的手動驗證作為 MVP 補充。

**Organization**: Tasks 依 user story 分組，確保每個故事都能獨立完成、獨立驗證
與獨立展示。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可平行執行（檔案不同，且不依賴尚未完成的任務）
- **[Story]**: 對應 user story（`[US1]`, `[US2]`, `[US3]`）
- 每個任務描述都包含確切檔案路徑

## Path Conventions

- 前端程式碼放在 `src/client/`
- 後端程式碼放在 `src/server/`
- 共用契約與型別放在 `src/shared/`
- DB migration 放在 `db/migrations/`
- 自動化測試放在 `tests/unit/` 與 `tests/integration/`

## Phase 1: Setup (Project Initialization)

**Purpose**: 建立 React + TypeScript + Node 全端 MVP 的最小工作骨架

- [X] T001 建立專案 manifest 與開發腳本於 `package.json`
- [X] T002 設定 TypeScript 編譯配置於 `tsconfig.json` 與 `tsconfig.node.json`
- [X] T003 [P] 設定 Vite 與 HTML shell 於 `vite.config.ts` 與 `index.html`
- [X] T004 [P] 設定 lint 與測試工具鏈於 `eslint.config.js` 與 `vitest.config.ts`
- [X] T005 [P] 建立前後端啟動入口於 `src/client/main.tsx` 與 `src/server/index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 建立所有 user story 共用且會阻塞後續實作的核心基礎

**⚠️ CRITICAL**: 此階段完成前，不應開始任何 user story 任務

- [X] T006 定義共用 lookup 契約與型別於 `src/shared/contracts/lookup.ts` 與 `src/shared/types/lookup.ts`
- [X] T007 [P] 建立環境變數解析與 Express app 組裝於 `src/server/config/env.ts` 與 `src/server/app.ts`
- [X] T008 [P] 建立 `lookup_records` migration 於 `db/migrations/001_create_lookup_records.sql`
- [X] T009 建立 PostgreSQL pool 與 repository 骨架於 `src/server/db/pool.ts` 與 `src/server/repositories/lookupRepository.ts`
- [X] T010 [P] 建立 parser 與 service 骨架於 `src/server/parsers/mcpMarketParser.ts` 與 `src/server/services/lookupService.ts`
- [X] T011 [P] 建立前端 API helper 與共用 feedback shell 於 `src/client/services/api.ts`, `src/client/app/App.tsx`, `src/client/components/FeedbackState.tsx`
- [X] T012 建立主頁骨架與共用樣式底稿於 `src/client/pages/HomePage.tsx` 與 `src/client/styles/app.css`

**Checkpoint**: 資料契約、DB、server shell、client shell 均已就緒，可開始 user story 開發

---

## Phase 3: User Story 1 - 解析 Skill 頁面為原始 GitHub 連結 (Priority: P1) 🎯 MVP

**Goal**: 讓使用者輸入受支援的 `mcpmarket.com` URL 後，可得到 download 位置與 GitHub 真實連結

**Independent Test**: 輸入有效的 skill 詳情頁 URL 或 download API URL，系統應顯示原始輸入、download 位置、GitHub 真實連結、狀態與時間，且連結可直接開啟

### Validation for User Story 1

- [X] T013 [P] [US1] 新增 URL 分類與 GitHub 正規化單元測試於 `tests/unit/server/mcpMarketParser.test.ts`
- [X] T014 [P] [US1] 新增成功解析流程整合測試於 `tests/integration/server/resolveLookup.success.test.ts`

### Implementation for User Story 1

- [X] T015 [P] [US1] 實作 download 位置擷取與 GitHub 真實連結正規化於 `src/server/parsers/mcpMarketParser.ts`
- [X] T016 [P] [US1] 實作上游抓取與 HTML 解析服務於 `src/server/services/mcpMarketFetcher.ts`
- [X] T017 [US1] 實作成功查詢的 resolve orchestration 與保存流程於 `src/server/services/lookupService.ts`
- [X] T018 [US1] 實作 `POST /api/lookups/resolve` 端點於 `src/server/api/lookupRoutes.ts`
- [X] T019 [P] [US1] 建立查詢表單與結果卡片元件於 `src/client/components/LookupForm.tsx` 與 `src/client/components/LookupResult.tsx`
- [X] T020 [US1] 串接查詢送出、載入與成功狀態於 `src/client/pages/HomePage.tsx`
- [X] T021 [US1] 完成 lookup flow 的響應式與鍵盤可及性樣式於 `src/client/styles/app.css`

**Checkpoint**: User Story 1 可獨立完成，且構成 MVP 可展示切片

---

## Phase 4: User Story 2 - 檢視與搜尋過往查詢紀錄 (Priority: P2)

**Goal**: 讓使用者檢視成功解析歷史、搜尋關鍵字並以每頁 10 筆瀏覽

**Independent Test**: 建立至少 12 筆成功紀錄後，歷史列表應只顯示成功紀錄、支援搜尋，並以固定 10 筆分頁呈現

### Validation for User Story 2

- [X] T022 [P] [US2] 新增成功歷史搜尋與分頁 repository 測試於 `tests/unit/server/lookupRepository.history.test.ts`
- [X] T023 [P] [US2] 新增歷史 API 與 UI 整合測試於 `tests/integration/history/historyFlow.test.ts`

### Implementation for User Story 2

- [X] T024 [US2] 實作 success-only 歷史查詢與分頁 metadata 於 `src/server/repositories/lookupRepository.ts`
- [X] T025 [US2] 實作 `GET /api/history` 端點於 `src/server/api/historyRoutes.ts`
- [X] T026 [P] [US2] 建立歷史列表與分頁元件於 `src/client/components/HistoryList.tsx` 與 `src/client/components/Pagination.tsx`
- [X] T027 [P] [US2] 實作歷史搜尋條件與 API 串接於 `src/client/hooks/useHistoryQuery.ts` 與 `src/client/services/lookups.ts`
- [X] T028 [US2] 將搜尋、空狀態與分頁歷史整合到主頁於 `src/client/pages/HomePage.tsx`

**Checkpoint**: User Story 2 能以 seeded success records 獨立驗證，不依賴 US3 失敗流程

---

## Phase 5: User Story 3 - 取得可恢復的錯誤回饋 (Priority: P3)

**Goal**: 讓使用者在輸入不合法、來源不可解析或來源不受支援時得到清楚且可重試的錯誤回饋

**Independent Test**: 輸入非受支援 URL 或可抓取但無法解析來源位置的受支援 URL，系統應顯示對應錯誤訊息，且失敗紀錄不得出現在歷史列表

### Validation for User Story 3

- [X] T029 [P] [US3] 新增輸入驗證與失敗分類單元測試於 `tests/unit/server/lookupFailure.test.ts`
- [X] T030 [P] [US3] 新增錯誤回饋整合測試於 `tests/integration/resolve/resolveLookup.failure.test.ts`

### Implementation for User Story 3

- [X] T031 [US3] 實作 invalid/unsupported/upstream failure 對映於 `src/server/services/lookupService.ts`
- [X] T032 [US3] 實作失敗紀錄保存與歷史可見性規則於 `src/server/repositories/lookupRepository.ts`
- [X] T033 [US3] 讓 `POST /api/lookups/resolve` 回傳符合失敗契約的 payload 於 `src/server/api/lookupRoutes.ts`
- [X] T034 [P] [US3] 建立 inline validation 與 recoverable error 元件於 `src/client/components/ErrorNotice.tsx` 與 `src/client/components/LookupForm.tsx`
- [X] T035 [US3] 串接錯誤、重試與不可顯示於歷史列表的 UI 狀態於 `src/client/pages/HomePage.tsx`

**Checkpoint**: User Story 3 可獨立驗證錯誤情境，且不會污染成功歷史列表

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 收斂跨故事的一致性、效能與文件品質

- [X] T036 [P] 對齊 OpenAPI 契約與 shared contract 實作於 `specs/001-skill-link-resolver/contracts/lookup-api.openapi.yaml` 與 `src/shared/contracts/lookup.ts`
- [X] T037 檢查並移除未使用的執行期與開發相依於 `package.json`
- [X] T038 [P] 收斂 quickstart 指令與手動驗證內容於 `specs/001-skill-link-resolver/quickstart.md`
- [X] T039 [P] 補強外部抓取 timeout 與歷史查詢效能保護於 `src/server/services/mcpMarketFetcher.ts` 與 `src/server/repositories/lookupRepository.ts`
- [X] T040 驗證 release-ready build/test 文件與交付說明於 `specs/001-skill-link-resolver/plan.md` 與 `specs/001-skill-link-resolver/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 無依賴
- **Phase 2 (Foundational)**: 依賴 Phase 1 完成，且阻塞全部 user stories
- **Phase 3 (US1)**: 依賴 Phase 2 完成
- **Phase 4 (US2)**: 依賴 Phase 2 完成；以 seeded success data 可獨立驗證
- **Phase 5 (US3)**: 依賴 Phase 2 完成；實務排程上建議在 US1 resolve flow 穩定後進行
- **Phase 6 (Polish)**: 依賴所有選定故事完成

### User Story Dependencies

- **US1**: MVP 核心故事，最先交付
- **US2**: 依賴 shared contracts、DB schema 與 success record 結構，但不依賴 US3
- **US3**: 依賴 shared resolve pipeline，與 US1 共用同一條 resolve API，但驗證可獨立進行

### Parallel Opportunities

- **Setup**: `T003`, `T004`, `T005` 可在 `T001`、`T002` 完成後平行進行
- **Foundational**: `T007`, `T008`, `T010`, `T011` 可平行進行，之後再接 `T009`、`T012`
- **US1**: `T013` 與 `T014` 可平行；`T015`, `T016`, `T019` 可在 foundation 完成後分工
- **US2**: `T022` 與 `T023` 可平行；`T026` 與 `T027` 可平行
- **US3**: `T029` 與 `T030` 可平行；`T034` 可與 `T031` 平行，但需在 `T033` 前對齊錯誤契約
- **Polish**: `T036`, `T038`, `T039` 可平行

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1 與 Phase 2
2. 完成 Phase 3（US1）
3. 執行 US1 的自動化驗證與 quickstart 手動驗證
4. 先確認 lookup 解析 MVP 可接受，再擴充歷史列表與錯誤 UX

### Incremental Delivery

1. 先交付 US1，確保解析流程與資料保存可用
2. 再交付 US2，利用已保存的 success records 提供歷史搜尋與分頁
3. 最後交付 US3，補足 recoverable error paths 與 failure persistence
4. 以 Phase 6 收斂契約、效能與交付文件

### Parallel Team Strategy

1. 一個人先完成 Setup + Foundational
2. 之後可將 US1 前端、US1 後端拆開並行
3. US2 可由另一位成員以 seeded data 開始進行
4. US3 建議在 US1 resolve contract 穩定後接手，避免同檔衝突

## Notes

- 全部任務都遵循 `- [ ] T### ...` 的 checklist 格式
- `[P]` 僅標記可在不同檔案上平行執行的任務
- 各 user story 都有主要行為驗證與至少一個失敗或邊界驗證
- 建議第一個可交付里程碑只做到 US1
