-- ============================================
-- Migration 008: Custom Embeds & Social Links
-- Stored embeds and social link profiles
-- ============================================

CREATE TABLE IF NOT EXISTS custom_embeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    name TEXT NOT NULL,
    channel_id TEXT,
    message_id TEXT,
    embed_data TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(guild_id, name)
);

CREATE INDEX IF NOT EXISTS idx_embeds_guild ON custom_embeds(guild_id);

CREATE TABLE IF NOT EXISTS social_links (
    guild_id TEXT PRIMARY KEY,
    twitch TEXT,
    youtube TEXT,
    tiktok TEXT,
    twitter TEXT,
    instagram TEXT,
    website TEXT,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
