-- ============================================
-- Migration 001: Core tables
-- Guild settings and audit logs
-- ============================================

CREATE TABLE IF NOT EXISTS guild_settings (
    guild_id TEXT PRIMARY KEY,
    language TEXT NOT NULL DEFAULT 'en-US',
    mod_log_channel TEXT,
    automod_log_channel TEXT,
    ticket_category TEXT,
    ticket_support_role TEXT,
    ticket_log_channel TEXT,
    ticket_max_open INTEGER NOT NULL DEFAULT 1,
    ticket_auto_close_hours INTEGER NOT NULL DEFAULT 48,
    warn_escalation TEXT NOT NULL DEFAULT '{"3":"mute","5":"kick","7":"ban"}',
    anti_raid_enabled INTEGER NOT NULL DEFAULT 0,
    anti_raid_threshold INTEGER NOT NULL DEFAULT 10,
    anti_raid_timeframe INTEGER NOT NULL DEFAULT 30,
    welcome_enabled INTEGER NOT NULL DEFAULT 0,
    welcome_channel TEXT,
    welcome_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS warnings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    reason TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_warnings_guild_user ON warnings(guild_id, user_id);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    action TEXT NOT NULL,
    moderator_id TEXT NOT NULL,
    target_id TEXT,
    reason TEXT,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_guild ON audit_logs(guild_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_guild_action ON audit_logs(guild_id, action);
