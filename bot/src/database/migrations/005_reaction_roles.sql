-- ============================================
-- Migration 005: Reaction Roles
-- Self-assignable roles via button panels
-- ============================================

CREATE TABLE IF NOT EXISTS reaction_role_panels (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    guild_id TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    message_id TEXT,
    title TEXT NOT NULL DEFAULT 'Role Selection',
    description TEXT,
    color TEXT DEFAULT '#7C3AED',
    mode TEXT NOT NULL DEFAULT 'toggle',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rr_panels_guild ON reaction_role_panels(guild_id);
CREATE INDEX IF NOT EXISTS idx_rr_panels_message ON reaction_role_panels(message_id);

CREATE TABLE IF NOT EXISTS reaction_role_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    panel_id INTEGER NOT NULL REFERENCES reaction_role_panels(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL,
    emoji TEXT,
    label TEXT NOT NULL,
    description TEXT,
    style TEXT NOT NULL DEFAULT 'secondary'
);

CREATE INDEX IF NOT EXISTS idx_rr_entries_panel ON reaction_role_entries(panel_id);
