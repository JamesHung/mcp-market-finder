# 2026-03-19 skill page browser fallback

## 問題分析

- 使用者輸入 `https://mcpmarket.com/zh/tools/skills/react-code-fix-linter` 時，
  系統只能回 `UPSTREAM_UNAVAILABLE`，無法解析出 GitHub 真實連結。
- 同一筆 skill 若改輸入對應的 download URL，
  `https://mcpmarket.com/api/skills/download?url=...`，
  則可以正常解析出 GitHub 連結。
- 實際用 `curl` 抓 skill page 會收到 `403` 與
  `x-vercel-mitigated: deny`，回應內容是 `Vercel Security Checkpoint`。
- 實際用 headless browser 開同一個 skill page，頁面會正常載入，
  而且 DOM 中可以拿到 `Download Skill` 連結。

## Root Cause

- 既有 `McpMarketFetcher` 只使用 server-side `fetch` 抓 mcpmarket skill page HTML。
- mcpmarket 的 skill 詳情頁目前被 Vercel Security Checkpoint 保護，
  純 HTTP 抓頁會被視為 bot 而遭到阻擋。
- download URL 路徑不需要再抓 skill page，因此沒有踩到這個限制。

## 解決方法

- 在 `McpMarketFetcher` 中保留原本快速的 HTTP `fetch` 路徑。
- 若偵測到 `403`、`x-vercel-mitigated: deny`，
  或 HTML 內容含 `Vercel Security Checkpoint`，
  自動 fallback 到 headless browser。
- 由 browser 實際打開 skill page，等待 `Download Skill` 連結出現在 DOM，
  再把 HTML 交回既有 parser 處理。
- 補上單元測試，確認：
  - upstream 正常可讀時不會啟用 browser fallback
  - upstream 被 Vercel 擋下時會改走 browser fallback
