-- ============================================
-- Migration 004: Temporary Voice Channels
-- Join-to-Create voice channel system
-- ============================================

CREATE TABLE IF NOT EXISTS voice_settings (
    guild_id TEXT PRIMARY KEY,
    hub_channel_id TEXT,
    category_id TEXT,
    default_limit INTEGER NOT NULL DEFAULT 0,
    default_name TEXT NOT NULL DEFAULT '{user}''s Channel',
    enabled INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS temp_channels (
    channel_id TEXT PRIMARY KEY,
    guild_id TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    name TEXT,
    user_limit INTEGER NOT NULL DEFAULT 0,
    locked INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_temp_channels_guild ON temp_channels(guild_id);
CREATE INDEX IF NOT EXISTS idx_temp_channels_owner ON temp_channels(guild_id, owner_id);
