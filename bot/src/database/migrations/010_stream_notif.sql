-- ============================================
-- Migration 010: Live Stream Notifications
-- Twitch & YouTube live alerts
-- ============================================

CREATE TABLE IF NOT EXISTS stream_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    platform TEXT NOT NULL,
    platform_user TEXT NOT NULL,
    notify_channel TEXT NOT NULL,
    ping_role TEXT,
    custom_message TEXT,
    last_stream_id TEXT,
    is_live INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(guild_id, platform, platform_user)
);

CREATE INDEX IF NOT EXISTS idx_stream_notif_guild ON stream_notifications(guild_id);
CREATE INDEX IF NOT EXISTS idx_stream_notif_platform ON stream_notifications(platform);
