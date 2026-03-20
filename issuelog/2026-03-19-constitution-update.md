# 2026-03-19 憲章同步問題紀錄

## 問題 1：spec-kit workflow 檢查腳本預設路徑不存在

### 問題分析

技能文件要求先執行
`~/.codex/skills/spec-kit-workflow/scripts/check_spec_kit_repo.sh --json`，
但此環境實際不存在該路徑，造成自動檢查無法直接執行。

### Root Cause

本機技能安裝位置與技能文件中的預設路徑不一致；技能本體存在於
`/Users/hungming-hung/skills/spec-kit-workflow/`，而不是 `~/.codex/skills/`
底下。

### 解決方法

直接讀取技能說明檔與 repo 內的 `.specify/` 結構，改用人工檢查流程完成
repo readiness、模板同步與憲章更新，不依賴缺失的檢查腳本。

## 問題 2：`scripts/check-doc-ref-links.sh` 缺失

### 問題分析

專案 `AGENTS.md` 明確要求，若變更包含 `*.md`，提交前必須先執行
`scripts/check-doc-ref-links.sh`。本 repo 當下沒有 `scripts/` 目錄，也沒有
這支檢查腳本，導致既定提交流程無法完成。

### Root Cause

repository 初始化時尚未建立文件連結檢查工具，但工作流程已依賴該腳本。

### 解決方法

新增 `scripts/check-doc-ref-links.sh`。目前腳本在 `docs/` 不存在時會安全略過，
若未來有 `docs/*.md`，會檢查是否出現不符合規範的 inline relative Markdown
links，讓文件提交流程至少有可執行的基本驗證入口。

## 問題 3：spec 生成功能再次遇到 readiness 檢查腳本缺失

### 問題分析

在執行本次 feature specification 流程時，`spec-kit-workflow` 技能仍要求先跑
`~/.codex/skills/spec-kit-workflow/scripts/check_spec_kit_repo.sh --json`，但實際
環境依然沒有這個腳本，造成標準 readiness 檢查無法直接完成。

### Root Cause

技能文件內寫死的腳本位置與本機技能安裝位置不一致；技能存在於
`/Users/hungming-hung/skills/spec-kit-workflow/`，但該路徑下也未附帶同名
`scripts/check_spec_kit_repo.sh`。

### 解決方法

本次改為直接檢查 repo 內的 `.specify/` 目錄、模板與腳本是否存在，並依照
feature 建立腳本與模板手動完成 spec 產生流程，避免因技能外部檢查腳本缺失而
阻塞需求規格建立。

## 問題 4：staged Markdown 檔案含有 trailing whitespace

### 問題分析

在提交前執行 `git diff --cached --check` 時，系統回報新建的 `spec.md` 與
`requirements.md` 含有行尾空白，導致 staged 內容未通過基本格式檢查。

### Root Cause

編寫 Markdown 標頭區時沿用了模板常見的硬換行寫法，在行尾保留兩個空白，
與 `git diff --check` 的預設規則衝突。

### 解決方法

移除相關行尾空白，改用一般換行排版，之後重新執行 `git diff --cached --check`
確認 staged 內容可乾淨提交。

## 問題 5：更新 `AGENTS.md` 前工作樹已有中斷留下的未提交變更

### 問題分析

在本次僅要求更新 `AGENTS.md` 的工作開始前，repository 工作樹已經存在多個
未提交的檔案與修改，來源是前一輪被使用者中斷的實作流程。若直接將所有變更一併
提交，會把未完成且未經使用者確認的實作骨架一起帶入 commit。

### Root Cause

前一輪實作流程在 Setup/Foundational 階段途中被中止，導致 `package.json`、
`src/`、`tests/` 等檔案仍留在工作樹中，但尚未完成驗證與整理。

### 解決方法

本次只針對使用者明確要求的 `AGENTS.md` 規範與必要 issue log 做修改與提交，
其餘既有未提交變更保留在工作樹，不做回滾也不併入本次 commit；回報時明確揭露
工作樹仍有殘留修改。

## 問題 6：歷史搜尋切換分頁與關鍵字時產生重複請求

### 問題分析

在 `useHistoryQuery` 初版實作中，歷史列表在頁碼切換或送出搜尋後會重複呼叫
`/api/history`，導致測試觀察到同一條件下多次 fetch，且在某些情況下可能讓後到
的舊結果覆蓋新結果。

### Root Cause

hook 使用 React 19 的 `useEffectEvent` 包裝載入函式，但又把該函式放進
`useEffect` dependency array。由於 render 後 effect event 的引用會觸發新的
effect 執行，載入狀態更新又會造成額外 render，形成重複請求。

### 解決方法

將 history 參數整合為單一 state 物件，並讓 `useEffect` 只依賴查詢參數與
refresh key，不再把 `useEffectEvent` 本身納入 dependency，避免重複請求與
狀態覆寫。

## 問題 7：server build 因型別推斷過嚴而失敗

### 問題分析

`npm run build` 在 client 產物完成後，server 的 TypeScript 編譯失敗，阻塞整體
release-ready 驗證。

### Root Cause

`McpMarketFetcher` constructor 的 timeout 預設值從常數帶入時被推斷成 literal
type `5000`；另外 `Queryable` 對泛型 row 設下 `Record<string, unknown>`
約束，與實際資料列介面缺少 index signature 的型別定義不相容。

### 解決方法

把 timeout constructor 參數明確標註為 `number`，並把 `Queryable` 的 row
泛型約束放寬為 `object`，讓 `tsc -p tsconfig.node.json` 能順利編譯通過。

## 問題 8：Chrome MCP 測試規則需要反映 session 工具實際可用性

### 問題分析

原本 `AGENTS.md` 直接規定所有網頁 UI、自動化驗證與手動測試都必須使用
Chrome MCP，但實際 agent session 是否提供 Chrome MCP 工具，取決於啟動時的
MCP 設定，而不是專案文件本身。

### Root Cause

文件把「應優先使用 Chrome MCP」寫成無條件規則，沒有把「當前 session 是否
真的有 Chrome MCP 工具」這個前提條件寫清楚，導致規則與實際執行環境可能衝突。

### 解決方法

將規則改為條件式：若當前 session 已提供 Chrome MCP，必須優先使用；若未提供，
則需先在回報中明確說明，再由使用者決定是否接受其他測試方案。這樣重啟 session
並正確掛載 Chrome MCP 後，規則即可直接生效。

## 問題 9：sub-agent 委派規則需要反映上層執行限制

### 問題分析

原本 `AGENTS.md` 直接要求執行專案任務時預設應 `spawn one agent` 協助處理，
但實際是否允許啟動 sub-agent，仍受當前 session 的上層執行策略限制。當上層
策略要求必須由使用者明確要求委派後才能啟動時，無條件規則會與實際執行限制衝突。

### Root Cause

文件將「應委派 sub-agent」寫成預設且近乎無條件的規則，未把「當前 session
與上層策略是否允許」以及「是否有使用者明確要求」這兩個前提寫清楚。

### 解決方法

將 `AGENTS.md` 中的規則改為條件式：若當前 session 與上層策略允許，且使用者
明確要求委派，則至少 `spawn one agent`；若因上層限制、任務性質或使用者未要求
而未委派，則需在回報中說明原因，使文件規範與實際可執行條件一致。

## 問題 10：Chrome MCP 手動驗證時 skill 詳情頁解析受上游防護阻擋

### 問題分析

在本次依 `quickstart.md` 進行 Chrome MCP 手動驗證時，輸入
`https://mcpmarket.com/zh/tools/skills/react-code-fix-linter` 後，前端顯示
「目前無法讀取 skill 頁面，請稍後再試」。進一步檢查發現，server 端對該 skill
詳情頁的抓取請求遭到上游防護攔截。

### Root Cause

`mcpmarket.com` 目前對本機環境的非瀏覽器式請求回傳 `403` / `429`，內容為
Vercel Security Checkpoint，因此 `McpMarketFetcher` 在 server-side fetch
skill 頁面時無法取得實際 HTML，也就無法從頁面中抽出 download URL。

### 解決方法

本次手動驗證改採兩段式處理：

1. 先以 Chrome MCP 直接開啟 mcpmarket skill 頁面，從瀏覽器已可見的頁面中確認
   真實 `Download Skill` 連結。
2. 再以該 download API URL 驗證應用程式的 download URL 解析、GitHub 連結開啟、
   歷史搜尋、分頁與錯誤流程。

因此本次可完整驗證 download API 與 UI 行為，但無法在當前環境下完成
「skill 詳情頁 URL 由 server 抓頁成功解析」這一條手動路徑，需待上游放行或
調整抓取策略後再補驗。

## 問題 11：未啟動 PostgreSQL 時 resolve API 只回傳泛用 500

### 問題分析

當使用者只執行 `npm run dev`，但尚未啟動 PostgreSQL 或尚未執行 migration 時，
送出 lookup 會在 server 端寫入查詢紀錄時失敗。原本 API 會把這類錯誤落入通用
error middleware，最後只回傳 `Unexpected server error.`，讓使用者無法判斷
實際缺的是資料庫而不是 lookup 邏輯本身。

### Root Cause

`lookup_records` 的保存流程依賴 PostgreSQL，但 `src/server/app.ts` 的 error
middleware 沒有辨識資料庫連線錯誤（例如 `ECONNREFUSED`）或資料庫初始化錯誤
（例如缺少資料庫 / 缺少 table），因此一律回傳泛用 `500 INTERNAL_ERROR`。

### 解決方法

在 `src/server/app.ts` 新增資料庫錯誤辨識邏輯，將 `ECONNREFUSED`、`ENOTFOUND`、
`EAI_AGAIN`、`42P01`、`3D000` 等錯誤對映為 `503 DATABASE_UNAVAILABLE`，並回傳
明確訊息：請先啟動 PostgreSQL 並執行 migration。同時新增整合測試覆蓋這條路徑，
避免之後再退回泛用 500。

## 問題 12：error middleware 會回應錯誤，但不會把實際例外印到 terminal

### 問題分析

使用者依建議查看 `npm run dev` / `make dev` 的 server terminal 時，發現失敗請求
雖然有回應錯誤，但終端沒有對應 log，因此無法從 server 端直接看到實際例外內容、
stack trace 或 AggregateError 內的子錯誤。

### Root Cause

`src/server/app.ts` 的 error middleware 原本只負責把錯誤轉成 JSON response，
沒有在回應前執行 `console.error` 或其他 logging，因此 server 端 failure context
只存在於 response，不存在於 terminal output。

### 解決方法

在 error middleware 中加入統一的 `console.error("Request failed", ...)`，
輸出 request method、path 與結構化錯誤內容；若錯誤是 `AggregateError`，也會一併
展開子錯誤。另更新整合測試確認錯誤發生時確實會寫入 server log。
