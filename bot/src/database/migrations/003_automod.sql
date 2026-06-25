-- ============================================
-- Migration 003: Auto-moderation tables
-- ============================================

CREATE TABLE IF NOT EXISTS automod_filters (
    guild_id TEXT NOT NULL,
    filter_name TEXT NOT NULL,
    enabled INTEGER NOT NULL DEFAULT 0,
    action TEXT NOT NULL DEFAULT 'delete',
    config TEXT NOT NULL DEFAULT '{}',
    PRIMARY KEY (guild_id, filter_name)
);

CREATE TABLE IF NOT EXISTS automod_whitelist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    UNIQUE(guild_id, type, target_id)
);

CREATE INDEX IF NOT EXISTS idx_automod_whitelist_guild ON automod_whitelist(guild_id);

CREATE TABLE IF NOT EXISTS word_filter (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    word TEXT NOT NULL,
    is_regex INTEGER NOT NULL DEFAULT 0,
    UNIQUE(guild_id, word)
);

CREATE INDEX IF NOT EXISTS idx_word_filter_guild ON word_filter(guild_id);
