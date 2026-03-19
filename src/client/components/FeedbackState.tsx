interface FeedbackStateProps {
  title: string;
  message: string;
}

export function FeedbackState({ title, message }: FeedbackStateProps) {
  return (
    <div className="feedback-state" role="status">
      <p className="feedback-title">{title}</p>
      <p className="feedback-message">{message}</p>
    </div>
  );
}
