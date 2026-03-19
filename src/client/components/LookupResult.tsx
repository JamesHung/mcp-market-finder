import type { ResolveLookupSuccessResponse } from "../../shared/types/lookup";

interface LookupResultProps {
  record: ResolveLookupSuccessResponse["record"];
}

export function LookupResult({ record }: LookupResultProps) {
  return (
    <article className="result-card" aria-live="polite">
      <div className="result-card__header">
        <div>
          <p className="section-kicker">Latest Result</p>
          <h2>解析完成</h2>
        </div>
        <span className="status-pill">成功</span>
      </div>

      <dl className="result-grid">
        <div>
          <dt>原始輸入</dt>
          <dd>
            <a href={record.inputUrl} target="_blank" rel="noreferrer">
              {record.inputUrl}
            </a>
          </dd>
        </div>
        <div>
          <dt>Download 位置</dt>
          <dd>
            <a href={record.downloadUrl} target="_blank" rel="noreferrer">
              {record.downloadUrl}
            </a>
          </dd>
        </div>
        <div>
          <dt>GitHub 真實連結</dt>
          <dd>
            <a href={record.githubUrl} target="_blank" rel="noreferrer">
              {record.githubUrl}
            </a>
          </dd>
        </div>
        <div>
          <dt>查詢時間</dt>
          <dd>{new Date(record.createdAt).toLocaleString("zh-TW")}</dd>
        </div>
      </dl>
    </article>
  );
}
