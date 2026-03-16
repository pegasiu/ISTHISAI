CREATE TABLE IF NOT EXISTS analysis_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content_hash TEXT NOT NULL UNIQUE,
  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'video', 'website', 'text')),
  is_ai_generated INTEGER NOT NULL,
  confidence REAL NOT NULL,
  reasoning TEXT NOT NULL,
  artifacts TEXT NOT NULL DEFAULT '[]',
  natural_elements TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_content_hash ON analysis_results(content_hash);
