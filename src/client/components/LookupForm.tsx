import type { FormEvent } from "react";
import { ErrorNotice } from "./ErrorNotice";

interface LookupFormProps {
  value: string;
  isPending: boolean;
  validationMessage: string | null;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export function LookupForm({
  value,
  isPending,
  validationMessage,
  onChange,
  onSubmit,
}: LookupFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form className="lookup-form" onSubmit={handleSubmit}>
      <label className="field-label" htmlFor="lookup-url">
        輸入 MCP Market skill 詳情頁或 download URL
      </label>
      <div className="lookup-form__row">
        <input
          id="lookup-url"
          className="text-input"
          name="lookupUrl"
          type="url"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://mcpmarket.com/zh/tools/skills/react-code-fix-linter"
          autoComplete="off"
          spellCheck={false}
          aria-describedby="lookup-help"
        />
        <button className="primary-button" type="submit" disabled={isPending}>
          {isPending ? "解析中..." : "開始解析"}
        </button>
      </div>
      <p className="field-help" id="lookup-help">
        支援 skill 詳情頁 URL 與 `api/skills/download?url=...` 形式。
      </p>
      {validationMessage ? (
        <ErrorNotice compact title="輸入有誤" message={validationMessage} />
      ) : null}
    </form>
  );
}
