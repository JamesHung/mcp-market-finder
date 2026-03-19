import { startTransition, useEffect, useEffectEvent, useState } from "react";
import type { HistoryListResponse } from "../../shared/types/lookup";
import { fetchHistory } from "../services/lookups";

const EMPTY_HISTORY: HistoryListResponse = {
  items: [],
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
};

export function useHistoryQuery(refreshKey: number) {
  const [history, setHistory] = useState<HistoryListResponse>(EMPTY_HISTORY);
  const [params, setParams] = useState({ page: 1, query: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadHistory = useEffectEvent(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetchHistory(params.page, params.query);
      setHistory(response);
    } catch {
      setErrorMessage("目前無法載入歷史列表，請稍後再試。");
      setHistory((current) => ({
        ...current,
        items: [],
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: params.page > 1,
      }));
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    void loadHistory();
  }, [params, refreshKey]);

  function submitSearch(nextQuery: string) {
    startTransition(() => {
      setParams({
        page: 1,
        query: nextQuery.trim(),
      });
    });
  }

  function changePage(nextPage: number) {
    startTransition(() => {
      setParams((current) => ({
        ...current,
        page: Math.max(1, nextPage),
      }));
    });
  }

  return {
    history,
    query: params.query,
    isLoading,
    errorMessage,
    submitSearch,
    changePage,
  };
}
