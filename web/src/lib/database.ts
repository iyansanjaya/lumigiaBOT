import Database from 'better-sqlite3';
import path from 'path';
import type { GuildSettings } from '@/types/guild';
import type { Ticket, TicketStats } from '@/types/ticket';
import type { Warning, AuditLog, AutoModFilter, AutoModWhitelistEntry } from '@/types/moderation';

const DB_PATH = process.env.DATABASE_PATH || 
  (process.env.NODE_ENV === 'production' 
    ? '/app/data/lumigiabot.db' 
    : path.join(process.cwd(), '..', 'data', 'lumigiabot.db'));

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, { fileMustExist: true });
    db.pragma('journal_mode = WAL');
    db.pragma('busy_timeout = 5000');
  }
  return db;
}

// ─────────────────────────── READ ───────────────────────────

export function getGuildSettings(guildId: string): GuildSettings | undefined {
  try {
    const db = getDb();
    return db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?').get(guildId) as GuildSettings | undefined;
  } catch { return undefined; }
}

export function getGuildWarnings(guildId: string, limit = 50): Warning[] {
  try {
    const db = getDb();
    return db.prepare('SELECT * FROM warnings WHERE guild_id = ? ORDER BY created_at DESC LIMIT ?').all(guildId, limit) as Warning[];
  } catch { return []; }
}

export function getGuildTickets(guildId: string, limit = 50): Ticket[] {
  try {
    const db = getDb();
    return db.prepare('SELECT * FROM tickets WHERE guild_id = ? ORDER BY created_at DESC LIMIT ?').all(guildId, limit) as Ticket[];
  } catch { return []; }
}

export function getGuildAuditLogs(guildId: string, limit = 50): AuditLog[] {
  try {
    const db = getDb();
    return db.prepare('SELECT * FROM audit_logs WHERE guild_id = ? ORDER BY created_at DESC LIMIT ?').all(guildId, limit) as AuditLog[];
  } catch { return []; }
}

export function getTicketStats(guildId: string): TicketStats {
  try {
    const db = getDb();
    const row = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'claimed' THEN 1 ELSE 0 END) as claimed,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM tickets WHERE guild_id = ?
    `).get(guildId) as TicketStats;
    return row || { total: 0, open: 0, claimed: 0, closed: 0 };
  } catch { return { total: 0, open: 0, claimed: 0, closed: 0 }; }
}

export function getAutoModFilters(guildId: string): AutoModFilter[] {
  try {
    const db = getDb();
    return db.prepare('SELECT * FROM automod_filters WHERE guild_id = ?').all(guildId) as AutoModFilter[];
  } catch { return []; }
}

export function getAutoModWhitelist(guildId: string): AutoModWhitelistEntry[] {
  try {
    const db = getDb();
    return db.prepare('SELECT * FROM automod_whitelist WHERE guild_id = ?').all(guildId) as AutoModWhitelistEntry[];
  } catch { return []; }
}

export function getDashboardStats(): { totalGuilds: number; totalTickets: number; totalWarnings: number } {
  try {
    const db = getDb();
    const guilds = db.prepare('SELECT COUNT(*) as count FROM guild_settings').get() as { count: number };
    const tickets = db.prepare('SELECT COUNT(*) as count FROM tickets').get() as { count: number };
    const warnings = db.prepare('SELECT COUNT(*) as count FROM warnings').get() as { count: number };
    return { totalGuilds: guilds.count, totalTickets: tickets.count, totalWarnings: warnings.count };
  } catch { return { totalGuilds: 0, totalTickets: 0, totalWarnings: 0 }; }
}

// ─────────────────────────── WRITE ───────────────────────────

/** Whitelist field yang diizinkan — sama persis dengan bot GuildSettingsRepo.js */
const ALLOWED_SETTINGS_FIELDS = new Set([
  'language', 'mod_log_channel', 'automod_log_channel',
  'ticket_category', 'ticket_support_role', 'ticket_log_channel',
  'ticket_max_open', 'ticket_auto_close_hours', 'warn_escalation',
  'anti_raid_enabled', 'anti_raid_threshold', 'anti_raid_timeframe',
  'welcome_enabled', 'welcome_channel', 'welcome_message',
]);

const ALLOWED_FILTER_NAMES = new Set([
  'spam', 'link', 'word', 'caps', 'emoji', 'mention',
]);

const ALLOWED_ACTIONS = new Set([
  'delete', 'warn', 'mute', 'kick', 'ban',
]);

/**
 * Update satu field guild settings.
 * Menggunakan whitelist ketat untuk mencegah SQL injection pada column name.
 */
export function updateGuildSetting(guildId: string, field: string, value: string | number | null): boolean {
  if (!ALLOWED_SETTINGS_FIELDS.has(field)) {
    throw new Error(`Field tidak diizinkan: ${field}`);
  }

  try {
    const db = getDb();
    // Pastikan row ada
    db.prepare('INSERT INTO guild_settings (guild_id) VALUES (?) ON CONFLICT(guild_id) DO NOTHING').run(guildId);
    // Update field — safe karena field sudah divalidasi dari whitelist
    db.prepare(`UPDATE guild_settings SET ${field} = ?, updated_at = datetime('now') WHERE guild_id = ?`).run(value, guildId);
    return true;
  } catch {
    return false;
  }
}

/**
 * Update automod filter (enable/disable, action).
 * Hanya filter name dan action yang ada di whitelist yang diizinkan.
 */
export function updateAutoModFilter(
  guildId: string,
  filterName: string,
  enabled: boolean,
  action: string,
): boolean {
  if (!ALLOWED_FILTER_NAMES.has(filterName)) {
    throw new Error(`Filter tidak diizinkan: ${filterName}`);
  }
  if (!ALLOWED_ACTIONS.has(action)) {
    throw new Error(`Action tidak diizinkan: ${action}`);
  }

  try {
    const db = getDb();
    db.prepare(`
      INSERT INTO automod_filters (guild_id, filter_name, enabled, action, config)
      VALUES (?, ?, ?, ?, '{}')
      ON CONFLICT(guild_id, filter_name) DO UPDATE SET
        enabled = excluded.enabled,
        action = excluded.action
    `).run(guildId, filterName, enabled ? 1 : 0, action);
    return true;
  } catch {
    return false;
  }
}
