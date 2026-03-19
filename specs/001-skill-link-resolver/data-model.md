# Data Model: MCP Skill 連結解析與查詢紀錄

## Overview

MVP 以一個 persisted entity 為核心，搭配兩個 request/query model 支援解析與
歷史列表流程。所有查詢都會被保存，但只有成功解析的紀錄會出現在歷史列表。

## Persisted Entity

### LookupRecord

**Purpose**: 保存一次 URL 解析嘗試及其最終結果，作為結果回顯、歷史列表與錯誤
追蹤的來源。

| Field | Type | Required | Notes |
|------|------|----------|------|
| `id` | `bigint` | Yes | 由資料庫遞增產生，供穩定排序與 API 識別使用 |
| `inputUrl` | `text` | Yes | 使用者提交的原始 URL |
| `normalizedInputUrl` | `text` | Yes | 去除多餘尾端斜線、統一編碼後的比較值；允許重複 |
| `inputType` | `enum(skill_page, download_api)` | Yes | 來自 spec clarify 的兩種支援輸入 |
| `skillSlug` | `text` | No | 若能從 skill 詳情頁 URL 推得 slug 則保存，便於搜尋 |
| `downloadUrl` | `text` | No | 實際找到的 download button 目標；download API 輸入可直接使用 |
| `githubUrl` | `text` | No | 成功正規化後的 GitHub 真實連結 |
| `status` | `enum(success, invalid_input, unsupported_input, missing_source, upstream_error, non_github_source)` | Yes | 只保存終態，不保存中間處理狀態 |
| `errorCode` | `text` | No | 對應失敗分類，供 UI 顯示與診斷 |
| `errorMessage` | `text` | No | 使用者可讀或記錄用的錯誤訊息 |
| `createdAt` | `timestamptz` | Yes | 預設為 `now()` |

**Derived Attributes**:

- `historyVisible`: 當 `status = success` 且 `githubUrl` 非空時為 `true`。
- `searchDocument`: 由 `inputUrl`、`downloadUrl`、`githubUrl`、`skillSlug` 組成
  的查詢範圍，用於大小寫不敏感搜尋。

**Validation Rules**:

- `inputUrl` 必須是可解析的絕對 URL，且 host 為 `mcpmarket.com`。
- `inputType = skill_page` 時，path 必須符合 `/.../tools/skills/...` 結構。
- `inputType = download_api` 時，path 必須為 `/api/skills/download`，且帶有
  `url` query parameter。
- `status = success` 時，`downloadUrl` 與 `githubUrl` 必須存在。
- `status != success` 時，`errorCode` 至少必須存在其一。

**Indexes**:

- Primary key: `id`
- B-tree index on `(status, created_at DESC, id DESC)`，支援成功歷史列表排序
  與固定分頁。
- 視資料量成長再評估搜尋索引；MVP 先以 case-insensitive filter + 成功集合
  篩選滿足需求。

## Request / Query Models

### LookupSubmission

**Purpose**: 封裝使用者送出的單一解析請求。

| Field | Type | Required | Notes |
|------|------|----------|------|
| `url` | `string` | Yes | 原始輸入 |

**Rules**:

- 提交前後都會進行 trim。
- 空字串、非 URL、非 `mcpmarket.com` host 一律視為 `invalid_input`。

### HistoryQuery

**Purpose**: 定義歷史列表的查詢條件。

| Field | Type | Required | Notes |
|------|------|----------|------|
| `page` | `integer` | Yes | 1-based 頁碼，最小值為 1 |
| `q` | `string` | No | 大小寫不敏感搜尋字詞 |

**Rules**:

- `pageSize` 固定為 10，不接受外部覆寫。
- 搜尋只作用在 `historyVisible = true` 的成功紀錄。
- 當 `q` 改變時，前端與 API 都視為新的結果集合，應從第一頁開始顯示。

## State Transitions

### Request Lifecycle

1. `received`: API 收到原始輸入。
2. `validated`: 系統判斷輸入格式是否受支援。
3. `resolved`: 對 skill 詳情頁抓取 download button，或對 download API URL 直接解碼。
4. `normalized`: 將來源位置轉為 GitHub 真實連結，並判斷是否為可接受的 GitHub 來源。
5. `persisted_success` or `persisted_failure`: 將終態寫入 `LookupRecord`。

資料庫只保存第 5 步的終態；前四步屬於請求處理流程，不作為獨立 persisted
state。

## Relationship Notes

- 一次 `LookupSubmission` 會產生一筆 `LookupRecord`。
- 一次 `HistoryQuery` 會回傳零到多筆 `LookupRecord`，但僅限 `historyVisible`
  為 `true` 的成功紀錄。
