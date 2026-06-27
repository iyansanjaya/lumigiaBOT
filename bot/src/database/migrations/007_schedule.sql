-- ============================================
-- Migration 007: Stream Schedule
-- Weekly streaming schedule per server
-- ============================================

CREATE TABLE IF NOT EXISTS stream_schedule (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    day_of_week INTEGER NOT NULL,
    time TEXT NOT NULL,
    timezone TEXT NOT NULL DEFAULT 'Asia/Jakarta',
    title TEXT NOT NULL,
    description TEXT,
    UNIQUE(guild_id, day_of_week, time)
);

CREATE INDEX IF NOT EXISTS idx_schedule_guild ON stream_schedule(guild_id);

CREATE TABLE IF NOT EXISTS schedule_settings (
    guild_id TEXT PRIMARY KEY,
    auto_post_channel TEXT,
    auto_post_enabled INTEGER NOT NULL DEFAULT 0
);
