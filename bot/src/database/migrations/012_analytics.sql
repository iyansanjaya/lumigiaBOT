-- ============================================
-- Migration 012: Analytics Dashboard
-- Daily stats and channel activity tracking
-- ============================================

CREATE TABLE IF NOT EXISTS daily_stats (
    guild_id TEXT NOT NULL,
    date TEXT NOT NULL,
    messages INTEGER NOT NULL DEFAULT 0,
    members_joined INTEGER NOT NULL DEFAULT 0,
    members_left INTEGER NOT NULL DEFAULT 0,
    active_users INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guild_id, date)
);

CREATE TABLE IF NOT EXISTS channel_activity (
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    date TEXT NOT NULL,
    messages INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (guild_id, channel_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_guild ON daily_stats(guild_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_channel_activity_guild ON channel_activity(guild_id, date DESC);
