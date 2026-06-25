-- ============================================
-- Migration 002: Ticket tables
-- ============================================

CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT UNIQUE,
    user_id TEXT NOT NULL,
    claimed_by TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    reason TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    closed_at TEXT,
    closed_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_tickets_guild ON tickets(guild_id);
CREATE INDEX IF NOT EXISTS idx_tickets_guild_status ON tickets(guild_id, status);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON tickets(guild_id, user_id, status);
