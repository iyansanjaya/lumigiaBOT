-- ============================================
-- Migration 009: Leveling & XP System
-- Per-guild XP tracking with role rewards
-- ============================================

CREATE TABLE IF NOT EXISTS user_xp (
    guild_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 0,
    messages INTEGER NOT NULL DEFAULT 0,
    last_xp_at TEXT,
    PRIMARY KEY (guild_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_xp_leaderboard ON user_xp(guild_id, xp DESC);

CREATE TABLE IF NOT EXISTS level_rewards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    level INTEGER NOT NULL,
    role_id TEXT NOT NULL,
    UNIQUE(guild_id, level)
);

CREATE INDEX IF NOT EXISTS idx_level_rewards_guild ON level_rewards(guild_id);

CREATE TABLE IF NOT EXISTS leveling_settings (
    guild_id TEXT PRIMARY KEY,
    enabled INTEGER NOT NULL DEFAULT 0,
    xp_per_message INTEGER NOT NULL DEFAULT 15,
    xp_cooldown INTEGER NOT NULL DEFAULT 60,
    multiplier REAL NOT NULL DEFAULT 1.0,
    multiplier_expires TEXT,
    announce_channel TEXT,
    ignored_channels TEXT NOT NULL DEFAULT '[]',
    ignored_roles TEXT NOT NULL DEFAULT '[]'
);
