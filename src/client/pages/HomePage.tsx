import { startTransition, useState } from "react";
import type {
  ResolveLookupFailureResponse,
  ResolveLookupSuccessResponse,
} from "../../shared/types/lookup";
import { ErrorNotice } from "../components/ErrorNotice";
import { HistoryList } from "../components/HistoryList";
import { LookupForm } from "../components/LookupForm";
import { LookupResult } from "../components/LookupResult";
import { Pagination } from "../components/Pagination";
import { useHistoryQuery } from "../hooks/useHistoryQuery";
import { resolveLookup, validateLookupUrl } from "../services/lookups";

export function HomePage() {
  const [lookupUrl, setLookupUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [lookupResult, setLookupResult] =
    useState<ResolveLookupSuccessResponse["record"] | null>(null);
  const [lookupFailure, setLookupFailure] =
    useState<ResolveLookupFailureResponse | null>(null);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const [searchDraft, setSearchDraft] = useState("");
  const { history, query, isLoading, errorMessage, submitSearch, changePage } =
    useHistoryQuery(historyRefreshKey);

  async function handleLookupSubmit() {
    const nextValidationMessage = validateLookupUrl(lookupUrl);
    setFormMessage(nextValidationMessage);

    if (nextValidationMessage) {
      setLookupResult(null);
      setLookupFailure(null);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resolveLookup({ url: lookupUrl.trim() });

      if ("error" in response) {
        setLookupFailure(response);
        setLookupResult(null);
        return;
      }

      setLookupFailure(null);
      setLookupResult(response.record);
      startTransition(() => {
        setHistoryRefreshKey((current) => current + 1);
      });
    } catch {
      setLookupFailure({
        record: {
          id: 0,
          inputUrl: lookupUrl.trim(),
          normalizedInputUrl: lookupUrl.trim(),
          inputType: "skill_page",
          skillSlug: null,
          downloadUrl: null,
          githubUrl: null,
          status: "upstream_error",
          errorCode: "NETWORK_ERROR",
          errorMessage: "目前無法完成查詢，請稍後再試。",
          createdAt: new Date().toISOString(),
        },
        error: {
          code: "NETWORK_ERROR",
          message: "目前無法完成查詢，請稍後再試。",
        },
      });
      setLookupResult(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-card hero-card--primary">
        <div className="hero-copy">
          <p className="eyebrow">MCP Market Finder</p>
          <h1>把 MCP Market skill 下載位址直接還原成 GitHub 真實連結</h1>
          <p className="hero-description">
            貼上 skill 詳情頁或 download URL，系統會解析對應的 GitHub 來源，
            並自動保存成功紀錄供搜尋與分頁瀏覽。
          </p>
        </div>
        <LookupForm
          value={lookupUrl}
          isPending={isSubmitting}
          validationMessage={formMessage}
          onChange={(value) => {
            setLookupUrl(value);
            if (formMessage) {
              setFormMessage(null);
            }
          }}
          onSubmit={() => void handleLookupSubmit()}
        />
      </section>

      <section className="content-grid">
        <article className="panel-card">
          {lookupResult ? (
            <LookupResult record={lookupResult} />
          ) : (
            <div className="panel-card__placeholder">
              <p className="section-kicker">Latest Result</p>
              <h2>等待查詢</h2>
              <p>完成一次成功解析後，結果會顯示在這裡。</p>
            </div>
          )}

          {lookupFailure ? (
            <ErrorNotice
              title="這次沒有成功解析"
              message={lookupFailure.error.message}
            />
          ) : null}
        </article>

        <section className="panel-card">
          <div className="panel-card__header">
            <div>
              <p className="section-kicker">History</p>
              <h2>成功解析紀錄</h2>
            </div>
            <form
              className="history-search"
              onSubmit={(event) => {
                event.preventDefault();
                submitSearch(searchDraft);
              }}
            >
              <label className="sr-only" htmlFor="history-query">
                搜尋歷史紀錄
              </label>
              <input
                id="history-query"
                className="text-input text-input--compact"
                type="search"
                value={searchDraft}
                onChange={(event) => setSearchDraft(event.target.value)}
                placeholder="搜尋 skill、來源或 GitHub"
              />
              <button className="secondary-button" type="submit">
                搜尋
              </button>
            </form>
          </div>

          <HistoryList
            items={history.items}
            isLoading={isLoading}
            errorMessage={errorMessage}
            hasSearched={Boolean(query)}
          />

          <Pagination
            page={history.page}
            totalPages={history.totalPages}
            hasNextPage={history.hasNextPage}
            hasPreviousPage={history.hasPreviousPage}
            onPageChange={changePage}
          />
        </section>
      </section>
    </main>
  );
}
