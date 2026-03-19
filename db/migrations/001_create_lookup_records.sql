CREATE TABLE IF NOT EXISTS lookup_records (
  id BIGSERIAL PRIMARY KEY,
  input_url TEXT NOT NULL,
  normalized_input_url TEXT NOT NULL,
  input_type TEXT NOT NULL CHECK (input_type IN ('skill_page', 'download_api')),
  skill_slug TEXT,
  download_url TEXT,
  github_url TEXT,
  status TEXT NOT NULL CHECK (
    status IN (
      'success',
      'invalid_input',
      'unsupported_input',
      'missing_source',
      'upstream_error',
      'non_github_source'
    )
  ),
  error_code TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lookup_records_success_history_idx
  ON lookup_records (status, created_at DESC, id DESC);
