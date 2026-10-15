CREATE TABLE IF NOT EXISTS poc_progress (
  client_id TEXT PRIMARY KEY NOT NULL,
  app_version TEXT NOT NULL,
  progress_json TEXT NOT NULL CHECK (length(progress_json) <= 20000),
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_poc_progress_updated_at
ON poc_progress(updated_at);
