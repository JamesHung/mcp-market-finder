# Feature Specification: MCP Skill 連結解析與查詢紀錄

**Feature Branch**: `[001-skill-link-resolver]`
**Created**: 2026-03-19
**Status**: Draft
**Input**: User description: "建立一個可輸入 `mcpmarket.com` skill 詳情頁網址的網頁，將對應下載位置轉成 GitHub 真實連結，並提供可搜尋、每頁 10 筆的歷史紀錄檢視。"

## Clarifications

### Session 2026-03-19

- Q: 系統應支援哪些輸入格式？ → A: 同時支援 skill 詳情頁 URL 與 download API URL。
- Q: 歷史列表是否顯示失敗查詢？ → A: 歷史列表只顯示成功解析的紀錄。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 解析 Skill 頁面為原始 GitHub 連結 (Priority: P1)

使用者貼上單一 `mcpmarket.com` skill 詳情頁網址或對應的 download API URL 後，系統會找出該筆資料的下載位置，並將其中對應的來源倉庫位置轉換成可直接開啟的 GitHub 真實連結，讓使用者不用再手動檢查下載按鈕或解碼參數。

**Why this priority**: 這是整個功能的核心價值，若無法從 skill 頁面得到 GitHub 真實連結，後續歷史檢視與搜尋都沒有意義。

**Independent Test**: 輸入一個有效且受支援的 `mcpmarket.com` skill 詳情頁網址或 download API URL，驗證系統能顯示原始輸入、對應下載位置與最終 GitHub 連結，且使用者可直接開啟該連結。

**Acceptance Scenarios**:

1. **Given** 使用者輸入有效的 `mcpmarket.com` skill 詳情頁網址或 download API URL，**When** 送出查詢，**Then** 系統顯示對應的下載位置與轉換後的 GitHub 真實連結。
2. **Given** 使用者輸入的受支援網址含有可解讀的來源位置，**When** 查詢完成，**Then** 系統會同時顯示原始輸入網址、解析結果狀態與查詢時間。

---

### User Story 2 - 檢視與搜尋過往查詢紀錄 (Priority: P2)

使用者可以回頭瀏覽先前成功解析的查詢紀錄，並透過文字搜尋快速找到特定 skill、來源頁面或 GitHub 連結，同時以固定每頁 10 筆的方式分頁查看。

**Why this priority**: 一旦解析結果被保存，使用者應能重複利用歷史資料，避免重複查詢相同 skill 頁面。

**Independent Test**: 建立超過 10 筆成功解析紀錄與若干失敗查詢後，驗證預設列表只顯示成功解析紀錄、以最新紀錄優先顯示、每頁僅顯示 10 筆，且輸入關鍵字後能只顯示符合條件的結果。

**Acceptance Scenarios**:

1. **Given** 系統內已有超過 10 筆成功解析紀錄與失敗查詢紀錄，**When** 使用者開啟歷史列表，**Then** 系統預設只顯示最新的 10 筆成功解析紀錄並提供前後頁切換。
2. **Given** 使用者輸入搜尋文字，**When** 執行搜尋，**Then** 系統只顯示符合條件的歷史紀錄，並從搜尋結果的第一頁開始顯示。

---

### User Story 3 - 取得可恢復的錯誤回饋 (Priority: P3)

當使用者輸入的網址不符合支援格式、來源頁面無法取得下載位置，或解析出的結果不是可接受的 GitHub 來源時，系統會提供清楚的錯誤訊息，讓使用者知道問題類型並可重新嘗試。

**Why this priority**: 此功能依賴外部公開頁面內容，失敗情境不可避免，必須讓使用者能理解問題並快速修正輸入。

**Independent Test**: 輸入不受支援的網址與無法解析來源位置的受支援輸入，驗證系統顯示可理解的錯誤原因，且不會把失敗誤顯示成成功結果。

**Acceptance Scenarios**:

1. **Given** 使用者輸入非受支援格式的網址，**When** 送出查詢，**Then** 系統拒絕處理並提示支援的輸入格式。
2. **Given** 使用者輸入的是受支援頁面但系統無法取得有效來源位置，**When** 查詢完成，**Then** 系統顯示失敗狀態與可恢復的提示內容。

### Edge Cases

- 使用者輸入 `mcpmarket.com` 網址，但既不是受支援的 skill 詳情頁，也不是受支援的 download API URL。
- 來源頁面可開啟，但沒有下載動作、下載位置缺少必要資訊，或轉換後不是可直接使用的 GitHub 連結。
- 查詢歷史不足 10 筆、搜尋結果為空，或使用者切換到超出範圍的頁碼。
- 系統已有失敗查詢紀錄，但歷史列表仍只顯示成功解析結果，避免使用者把失敗項目誤認為可再次使用的 GitHub 連結。
- 使用者重複查詢同一個 skill 頁面，系統仍須保留正確的查詢時間與狀態。
- 外部來源暫時不可用或回應過慢，系統必須提供失敗或逾時回饋，而不是無限等待。

## Assumptions & Scope Guardrails

- **Known Assumption**: 本功能不含登入與個人化資料隔離，歷史紀錄為此網站共用的查詢清單。
- **Known Assumption**: 文字搜尋預設為不區分大小寫，並比對輸入網址、下載位置、解析後的 GitHub 連結與可顯示的 skill 識別文字。
- **Known Assumption**: 每次查詢都會建立一筆獨立紀錄，以保留實際使用歷程，即使輸入網址重複也不合併；失敗查詢會被保存，但不會出現在使用者可見的歷史列表。
- **Out of Scope**: 不處理非 GitHub 來源倉庫的轉換與特殊下載流程。
- **Out of Scope**: 不提供使用者帳號、權限管理、匯出報表或批次匯入多個網址。
- **Dependencies**: 功能依賴 `mcpmarket.com` 的 skill 詳情頁或 download API URL 能公開存取，且內容中存在可推導來源倉庫位置的資訊。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系統 MUST 提供一個可輸入單一 `mcpmarket.com` skill 詳情頁網址或對應 download API URL 的查詢介面。
- **FR-002**: 系統 MUST 驗證輸入是否為受支援的 `mcpmarket.com` skill 詳情頁格式或 download API URL 格式，並在不符合時立即阻止查詢。
- **FR-003**: 系統 MUST 從受支援的 skill 詳情頁或 download API URL 找出對應的下載位置，並將其中的 GitHub 來源資訊轉換為可直接開啟的 GitHub 真實連結。
- **FR-004**: 系統 MUST 在查詢結果中顯示原始輸入網址、找到的下載位置、轉換後的 GitHub 真實連結、查詢狀態與查詢時間。
- **FR-005**: 系統 MUST 保存每一次查詢的結果，包含成功與失敗狀態，以保留完整查詢歷程。
- **FR-006**: 系統 MUST 提供只顯示成功解析紀錄的歷史列表，預設依查詢時間由新到舊排序，且每頁固定顯示 10 筆資料。
- **FR-007**: 系統 MUST 支援文字搜尋歷史列表，並僅以成功解析紀錄為搜尋與顯示對象。
- **FR-008**: 系統 MUST 在搜尋條件變更時將歷史列表重設到第一頁，避免顯示超出結果範圍的頁碼。
- **FR-009**: 系統 MUST 在無法解析、來源不可用或輸入不合法時，提供明確區分問題類型的錯誤訊息。
- **FR-010**: 系統 MUST 讓使用者能從結果區與歷史紀錄中再次開啟已解析出的 GitHub 真實連結。
- **FR-011**: 系統 MUST NOT 將未成功解析的紀錄顯示為可用的 GitHub 成功結果。

### Experience & Accessibility Requirements

- **EX-001**: 介面 MUST 在常見桌面與行動裝置寬度下保持可讀與可操作。
- **EX-002**: 輸入欄位、查詢按鈕、搜尋欄位、分頁控制與結果連結 MUST 具備可辨識標示並可透過鍵盤操作。
- **EX-003**: 功能 MUST 為查詢流程與歷史列表提供載入中、成功、失敗與無結果等明確回饋。
- **EX-004**: 使用者完成查詢、發生錯誤或切換分頁後，焦點位置與可見焦點狀態 MUST 保持清楚可預期。

### Data & Integration Requirements

- **DI-001**: 查詢頁面內容、轉換結果與歷史紀錄的資料處理 MUST 與畫面呈現責任分離。
- **DI-002**: 查詢紀錄 MUST 保存足以支援成功結果列表顯示、搜尋與分頁的結構化欄位，且不需重新查詢來源頁面即可重現已保存結果。
- **DI-003**: 功能 MUST 清楚定義哪些 skill 詳情頁格式與 download API URL 格式被視為受支援，以及在來源格式不符時的回應方式。
- **DI-004**: 功能 MUST 對外部頁面無法存取、資料缺漏或格式異常提供一致的降級處理。

### Key Entities *(include if feature involves data)*

- **Lookup Submission**: 一次由使用者送出的查詢，包含原始輸入網址、輸入類型、送出時間與驗證結果。
- **Resolution Record**: 一筆保存後的查詢結果，包含原始 skill 頁面、找到的下載位置、轉換後的 GitHub 連結、成功或失敗狀態、失敗原因、是否可出現在歷史列表與建立時間。
- **History Query**: 使用者瀏覽歷史時的檢視條件，包含搜尋字詞、目前頁碼與固定頁面大小，且僅作用於成功解析紀錄。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% 的有效且受支援輸入可在 5 秒內向使用者顯示對應的 GitHub 真實連結。
- **SC-002**: 100% 的無效或無法解析輸入都會顯示明確錯誤狀態，且錯誤訊息能指出是格式不符、來源不可用或缺少可用來源位置。
- **SC-003**: 使用者能在進入頁面後 3 次互動內完成一次歷史搜尋並看到第一頁符合結果。
- **SC-004**: 歷史列表在所有查詢條件下都能穩定維持每頁 10 筆、由新到舊的排序規則，且不顯示失敗查詢。
