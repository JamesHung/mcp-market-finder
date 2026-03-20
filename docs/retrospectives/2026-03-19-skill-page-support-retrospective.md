# 2026-03-19 Skill Page Support Retrospective

## 1. 做得好的地方

- 先用實測把問題定性，而不是直接猜。先確認了 download URL 正常、skill page URL 失敗，再往 upstream 防護與抓頁策略下手。
- 有把問題收斂到真正 root cause。不是前端壞掉，也不是 parser 壞掉，而是 server-side `fetch` 被 `Vercel Security Checkpoint` 擋住。
- 修法保留了快路徑。`McpMarketFetcher` 仍先走 HTTP 抓頁，只有被擋時才 fallback 到 browser。
- 有補 automated E2E，而且不只測 happy path，也把 upstream blocked 的失敗型態固定成測試。
- 有補 issue log，內容包含問題分析、root cause 與解法，符合 repo 規範。
- 每次修改後都有跑對應驗證，不是只看型別或單一測試。
- 修正最後有整理成獨立 `fix:` commit，工作目錄保持乾淨。

## 2. 浪費回合的地方

- 一開始先補了 stub 型的 Playwright E2E，雖然有價值，但沒有直接推進使用者當下的主問題。
- 在 `git add` 和 `git status` 上用了平行執行，導致第一次看到的 status 不可靠。
- `eslint .` 和 `playwright test` 曾平行跑，踩到 `test-results/` 的競態問題。這類驗證應照 `lint -> test -> build` 的順序執行。
- 在找 fallback 時，先試了幾條外部抓頁路徑，例如調整 `curl` header、試 `r.jina.ai`，收穫有限。其實應更早直接驗證 browser fallback 是否可行。
- 用 Chrome MCP 驗證成功路徑時，曾碰到受控 input 被污染，需要重開乾淨頁面，表示對工具行為的處理還不夠俐落。

## 3. 規格不清的地方

- spec 沒有明確定義：當 upstream skill page 對 server-side 抓頁啟用 bot protection 時，產品預期是回錯誤、重試、還是必須自動 fallback。
- spec 沒有明確定義 runtime 依賴邊界。這次修法把 `playwright` 放進 production dependency，部署面影響應先講清楚。
- 沒有定義 skill page 解析的 SLA 或 timeout 預期。browser fallback 會比直接 fetch 慢，是否接受需要先說明。
- 沒有定義解析來源的優先順序。是優先抓 HTML、API、JSON，還是走 browser automation，之前是臨場決定。
- 沒有定義部署環境是否允許 headless browser。
- spec 沒有把「真實第三方網站行為會變動」明確列成非功能需求。

## 4. 可以抽成通用 skill 的地方

- 外部網站有 anti-bot / checkpoint 時的 fallback workflow：
  先用 `curl/fetch` 驗證，再用 browser automation 驗證 DOM 是否可讀，再決定是否引入 browser fallback。
- 把對話中的實測結果轉成回歸測試的 workflow：
  先重現、定性 root cause、補單元測試、補 E2E、補 issue log、最後跑完整驗證。
- Web app + local API + Playwright test server 的測試骨架：
  自動起 Vite middleware、Express app、in-memory repo、reset endpoint、Playwright config。
- 遵循 repo 規範的交付 workflow：
  檢查 `AGENTS.md`、補 issue log、跑 doc link check、整理 commit message。

## 5. 應該寫進 constitution / AGENTS.md 的新規則

- 若問題涉及第三方網站抓取失敗，必須先判斷是 parser 問題、網路問題、還是 anti-bot/checkpoint 問題，再決定修法。
- 若修法引入新的 production runtime dependency，必須明確驗證 build、runtime、部署相容性，並在回報中點名這個變更。
- 對外部網站整合，若 mock 測試已過但真實站點行為可能不同，必須補至少一次 live verification。
- 執行驗證時避免將會互相干擾的命令平行化，例如 `lint` 與會建立或刪除輸出目錄的 E2E 測試。
- 若 repo 要求 issue log，凡是 root cause 來自外部系統行為、部署環境、或流程缺口時，都應補 issue log。
- 在要求自動 commit 的 repo，若本輪只是純驗證未修改檔案，應明確回報「未 commit，因無檔案變更」。

## 6. 應該新增的測試與驗證清單

- 單元測試
  - `McpMarketFetcher` 遇到 `403 + x-vercel-mitigated: deny` 時會走 browser fallback。
  - `McpMarketFetcher` 遇到 `200` 但 HTML 是 `Vercel Security Checkpoint` 時也會走 fallback。
  - browser fallback 逾時時，會回既有的 `UPSTREAM_UNAVAILABLE`。
- 整合測試
  - `POST /api/lookups/resolve` 對 skill page URL 在 browser fallback 成功時回 `200`。
  - `POST /api/lookups/resolve` 對 skill page URL 在 browser fallback 失敗時回 `502` 並帶一致錯誤碼。
- E2E
  - 從 skill page URL 輸入到 UI 顯示 GitHub link 的完整流程。
  - 同一筆 skill 先用 skill page、再用 download URL，確認結果一致。
  - browser fallback 比較慢時，前端 loading state 是否合理。
- 非功能驗證
  - `npm run build` 後的 production 啟動是否真的能載入 `playwright`。
  - 在乾淨機器上是否需要額外 `playwright install` 步驟；若需要，文件或 deploy 流程要補。
  - fallback 路徑的 timeout 與資源耗用是否可接受。
- 人工驗證清單
  - skill page URL 成功
  - download URL 成功
  - 非 GitHub download URL 正確失敗
  - 上游被擋時有 log
  - 歷史列表只記 success
  - 搜尋與分頁不受新 fallback 影響

## 相關紀錄

- 問題處理紀錄見 [skill-page-browser-fallback-issuelog][skill-page-browser-fallback-issuelog]。

[skill-page-browser-fallback-issuelog]: ../../issuelog/2026-03-19-skill-page-browser-fallback.md
