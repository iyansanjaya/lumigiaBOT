-- ============================================
-- Migration 011: Fan Art Gallery
-- Submission, approval, and gallery system
-- ============================================

CREATE TABLE IF NOT EXISTS fanart_settings (
    guild_id TEXT PRIMARY KEY,
    enabled INTEGER NOT NULL DEFAULT 0,
    submit_channel TEXT,
    gallery_channel TEXT,
    approval_required INTEGER NOT NULL DEFAULT 1,
    vote_emoji TEXT DEFAULT '⭐'
);

CREATE TABLE IF NOT EXISTS fanart_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    message_id TEXT,
    gallery_message_id TEXT,
    votes INTEGER NOT NULL DEFAULT 0,
    reviewed_by TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    reviewed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_fanart_guild ON fanart_submissions(guild_id);
CREATE INDEX IF NOT EXISTS idx_fanart_status ON fanart_submissions(guild_id, status);
CREATE INDEX IF NOT EXISTS idx_fanart_votes ON fanart_submissions(guild_id, votes DESC);
