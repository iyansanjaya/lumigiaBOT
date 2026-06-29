-- ─── Fan Art Votes (per-user tracking) ───────────────────────
-- Mencegah vote ganda: satu user hanya bisa vote 1x per submission.

CREATE TABLE IF NOT EXISTS fanart_votes (
    submission_id INTEGER NOT NULL,
    user_id       TEXT    NOT NULL,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (submission_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_fanart_votes_submission ON fanart_votes(submission_id);
