interface ErrorNoticeProps {
  title?: string;
  message: string;
  compact?: boolean;
}

export function ErrorNotice({
  title = "查詢失敗",
  message,
  compact = false,
}: ErrorNoticeProps) {
  return (
    <div
      className={compact ? "error-notice error-notice--compact" : "error-notice"}
      role="alert"
    >
      <p className="error-title">{title}</p>
      <p className="error-message">{message}</p>
    </div>
  );
}
