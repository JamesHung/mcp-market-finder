import type { HistoryRecord } from "../../shared/types/lookup";
import { FeedbackState } from "./FeedbackState";

interface HistoryListProps {
  items: HistoryRecord[];
  isLoading: boolean;
  errorMessage: string | null;
  hasSearched: boolean;
}

export function HistoryList({
  items,
  isLoading,
  errorMessage,
  hasSearched,
}: HistoryListProps) {
  if (isLoading) {
    return (
      <FeedbackState
        title="載入中"
        message="正在整理成功解析紀錄，請稍候。"
      />
    );
  }

  if (errorMessage) {
    return (
      <FeedbackState
        title="歷史列表暫時不可用"
        message={errorMessage}
      />
    );
  }

  if (items.length === 0) {
    return (
      <FeedbackState
        title={hasSearched ? "找不到符合結果" : "尚無成功紀錄"}
        message={
          hasSearched
            ? "換個關鍵字再試，或先新增新的成功解析結果。"
            : "完成一次成功解析後，這裡會自動顯示歷史紀錄。"
        }
      />
    );
  }

  return (
    <ul className="history-list">
      {items.map((item) => (
        <li className="history-item" key={item.id}>
          <div className="history-item__meta">
            <span className="status-pill status-pill--muted">
              {item.inputType === "skill_page" ? "Skill 頁" : "Download URL"}
            </span>
            <time dateTime={item.createdAt}>
              {new Date(item.createdAt).toLocaleString("zh-TW")}
            </time>
          </div>
          <p className="history-item__title">{item.skillSlug ?? "未提供 skill slug"}</p>
          <dl className="history-item__links">
            <div>
              <dt>輸入</dt>
              <dd>
                <a href={item.inputUrl} target="_blank" rel="noreferrer">
                  {item.inputUrl}
                </a>
              </dd>
            </div>
            <div>
              <dt>Download</dt>
              <dd>
                <a href={item.downloadUrl} target="_blank" rel="noreferrer">
                  {item.downloadUrl}
                </a>
              </dd>
            </div>
            <div>
              <dt>GitHub</dt>
              <dd>
                <a href={item.githubUrl} target="_blank" rel="noreferrer">
                  {item.githubUrl}
                </a>
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
