import Database from 'better-sqlite3';
import { getDatabasePath } from '@/lib/env';
import {
  AUTOMOD_ACTIONS,
  AUTOMOD_FILTER_KEYS,
  DISCORD_SNOWFLAKE_PATTERN,
  FANART_SETTINGS_FIELDS,
  GUILD_SETTINGS_FIELDS,
  LEVELING_SETTINGS_FIELDS,
  STREAM_PLATFORMS,
  VOICE_SETTINGS_FIELDS,
} from '@/lib/contracts';
import type { GuildSettings } from '@/types/guild';
import type { Ticket, TicketStats } from '@/types/ticket';
import type { Warning, AuditLog, AutoModFilter, AutoModWhitelistEntry } from '@/types/moderation';
import type {
  VoiceSettings, ReactionRolePanel, ReactionRoleEntry,
  Giveaway, StreamScheduleEntry, ScheduleSettings,
  LevelingSettings, UserXP, LevelReward,
  StreamNotification, FanArtSettings, FanArtSubmission,
  DailyStats, ChannelActivity,
} from '@/types/streamer';

const DB_PATH = getDatabasePath();
const DISCORD_SNOWFLAKE_RE = new RegExp(DISCORD_SNOWFLAKE_PATTERN);

export interface DashboardStats {
  totalGuilds: number;
  totalTickets: number;
  totalWarnings: number;
}

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, { fileMustExist: true });
    db.pragma('journal_mode = WAL');
    db.pragma('busy_timeout = 5000');
  }
  return db;
}

// ═══════════════════════════ CORE READ ═══════════════════════════

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

function getEmptyDashboardStats(): DashboardStats {
  return { totalGuilds: 0, totalTickets: 0, totalWarnings: 0 };
}

function uniqueValidGuildIds(guildIds: string[]) {
  return [...new Set(guildIds.filter((id) => DISCORD_SNOWFLAKE_RE.test(id)))];
}

export function getDashboardStatsForGuilds(guildIds: string[]): DashboardStats {
  const allowedGuildIds = uniqueValidGuildIds(guildIds);
  if (allowedGuildIds.length === 0) return getEmptyDashboardStats();

  try {
    const db = getDb();
    const placeholders = allowedGuildIds.map(() => '?').join(', ');
    const tickets = db
      .prepare(`SELECT COUNT(*) as count FROM tickets WHERE guild_id IN (${placeholders})`)
      .get(...allowedGuildIds) as { count: number };
    const warnings = db
      .prepare(`SELECT COUNT(*) as count FROM warnings WHERE guild_id IN (${placeholders})`)
      .get(...allowedGuildIds) as { count: number };

    return {
      totalGuilds: allowedGuildIds.length,
      totalTickets: tickets.count,
      totalWarnings: warnings.count,
    };
  } catch { return getEmptyDashboardStats(); }
}

// ═══════════════════════════ STREAMER READ ═══════════════════════════

// ── Voice Channels ──
export function getVoiceSettings(guildId: string): VoiceSettings | undefined {
  try {
    return getDb().prepare('SELECT * FROM voice_settings WHERE guild_id = ?').get(guildId) as VoiceSettings | undefined;
  } catch { return undefined; }
}

// ── Reaction Roles ──
export function getReactionRolePanels(guildId: string): ReactionRolePanel[] {
  try {
    return getDb().prepare('SELECT * FROM reaction_role_panels WHERE guild_id = ? ORDER BY created_at DESC').all(guildId) as ReactionRolePanel[];
  } catch { return []; }
}

export function getReactionRoleEntries(panelId: number): ReactionRoleEntry[] {
  try {
    return getDb().prepare('SELECT * FROM reaction_role_entries WHERE panel_id = ?').all(panelId) as ReactionRoleEntry[];
  } catch { return []; }
}

// ── Giveaways ──
export function getGuildGiveaways(guildId: string): Giveaway[] {
  try {
    return getDb().prepare('SELECT * FROM giveaways WHERE guild_id = ? ORDER BY created_at DESC LIMIT 25').all(guildId) as Giveaway[];
  } catch { return []; }
}

// ── Schedule ──
export function getStreamSchedule(guildId: string): StreamScheduleEntry[] {
  try {
    return getDb().prepare('SELECT * FROM stream_schedule WHERE guild_id = ? ORDER BY day_of_week, time').all(guildId) as StreamScheduleEntry[];
  } catch { return []; }
}

export function getScheduleSettings(guildId: string): ScheduleSettings | undefined {
  try {
    return getDb().prepare('SELECT * FROM schedule_settings WHERE guild_id = ?').get(guildId) as ScheduleSettings | undefined;
  } catch { return undefined; }
}

// ── Leveling ──
export function getLevelingSettings(guildId: string): LevelingSettings | undefined {
  try {
    return getDb().prepare('SELECT * FROM leveling_settings WHERE guild_id = ?').get(guildId) as LevelingSettings | undefined;
  } catch { return undefined; }
}

export function getLeaderboard(guildId: string, limit = 25): UserXP[] {
  try {
    return getDb().prepare('SELECT * FROM user_xp WHERE guild_id = ? ORDER BY xp DESC LIMIT ?').all(guildId, limit) as UserXP[];
  } catch { return []; }
}

export function getLevelRewards(guildId: string): LevelReward[] {
  try {
    return getDb().prepare('SELECT * FROM level_rewards WHERE guild_id = ? ORDER BY level').all(guildId) as LevelReward[];
  } catch { return []; }
}

// ── Stream Notifications ──
export function getStreamNotifications(guildId: string): StreamNotification[] {
  try {
    return getDb().prepare('SELECT * FROM stream_notifications WHERE guild_id = ?').all(guildId) as StreamNotification[];
  } catch { return []; }
}

// ── Fan Art ──
export function getFanArtSettings(guildId: string): FanArtSettings | undefined {
  try {
    return getDb().prepare('SELECT * FROM fanart_settings WHERE guild_id = ?').get(guildId) as FanArtSettings | undefined;
  } catch { return undefined; }
}

export function getFanArtGallery(guildId: string, limit = 25): FanArtSubmission[] {
  try {
    return getDb().prepare("SELECT * FROM fanart_submissions WHERE guild_id = ? AND status = 'approved' ORDER BY votes DESC LIMIT ?").all(guildId, limit) as FanArtSubmission[];
  } catch { return []; }
}

export function getFanArtPending(guildId: string): FanArtSubmission[] {
  try {
    return getDb().prepare("SELECT * FROM fanart_submissions WHERE guild_id = ? AND status = 'pending' ORDER BY created_at").all(guildId) as FanArtSubmission[];
  } catch { return []; }
}

// ── Analytics ──
export function getDailyAnalytics(guildId: string, days = 30): DailyStats[] {
  try {
    return getDb().prepare("SELECT * FROM daily_stats WHERE guild_id = ? AND date >= date('now', ?) ORDER BY date").all(guildId, `-${days} days`) as DailyStats[];
  } catch { return []; }
}

export function getTopChannels(guildId: string, days = 7, limit = 10): ChannelActivity[] {
  try {
    return getDb().prepare(`
      SELECT channel_id, SUM(messages) as total_messages
      FROM channel_activity
      WHERE guild_id = ? AND date >= date('now', ?)
      GROUP BY channel_id
      ORDER BY total_messages DESC
      LIMIT ?
    `).all(guildId, `-${days} days`, limit) as ChannelActivity[];
  } catch { return []; }
}

// ═══════════════════════════ CORE WRITE ═══════════════════════════

/** Whitelist field yang diizinkan — sama persis dengan bot GuildSettingsRepo.js */
const ALLOWED_SETTINGS_FIELDS = new Set(GUILD_SETTINGS_FIELDS);
const ALLOWED_FILTER_NAMES = new Set(AUTOMOD_FILTER_KEYS);
const ALLOWED_ACTIONS = new Set(AUTOMOD_ACTIONS);

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
  } catch (err) {
    console.error('[DB] updateGuildSetting failed:', err);
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
  config: string = '{}',
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
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(guild_id, filter_name) DO UPDATE SET
        enabled = excluded.enabled,
        action = excluded.action,
        config = excluded.config
    `).run(guildId, filterName, enabled ? 1 : 0, action, config);
    return true;
  } catch (err) {
    console.error('[DB] updateAutoModFilter failed:', err);
    return false;
  }
}

// ═══════════════════════════ STREAMER WRITE ═══════════════════════════

const ALLOWED_VOICE_FIELDS = new Set(VOICE_SETTINGS_FIELDS);
const ALLOWED_LEVELING_FIELDS = new Set(LEVELING_SETTINGS_FIELDS);

/** Update voice channel settings */
export function updateVoiceSetting(guildId: string, field: string, value: string | number | null): boolean {
  if (!ALLOWED_VOICE_FIELDS.has(field)) throw new Error(`Field tidak diizinkan: ${field}`);
  try {
    const db = getDb();
    db.prepare('INSERT INTO voice_settings (guild_id) VALUES (?) ON CONFLICT(guild_id) DO NOTHING').run(guildId);
    db.prepare(`UPDATE voice_settings SET ${field} = ? WHERE guild_id = ?`).run(value, guildId);
    return true;
  } catch (err) { console.error('[DB] updateVoiceSetting failed:', err); return false; }
}

/** Update leveling settings */
export function updateLevelingSetting(guildId: string, field: string, value: string | number | null): boolean {
  if (!ALLOWED_LEVELING_FIELDS.has(field)) throw new Error(`Field tidak diizinkan: ${field}`);
  try {
    const db = getDb();
    db.prepare('INSERT INTO leveling_settings (guild_id) VALUES (?) ON CONFLICT(guild_id) DO NOTHING').run(guildId);
    db.prepare(`UPDATE leveling_settings SET ${field} = ? WHERE guild_id = ?`).run(value, guildId);
    return true;
  } catch (err) { console.error('[DB] updateLevelingSetting failed:', err); return false; }
}

// ── Fan Art Settings Write ──
const ALLOWED_FANART_FIELDS = new Set(FANART_SETTINGS_FIELDS);

/** Update fan art settings */
export function updateFanArtSetting(guildId: string, field: string, value: string | number | null): boolean {
  if (!ALLOWED_FANART_FIELDS.has(field)) throw new Error(`Field tidak diizinkan: ${field}`);
  try {
    const db = getDb();
    db.prepare('INSERT INTO fanart_settings (guild_id) VALUES (?) ON CONFLICT(guild_id) DO NOTHING').run(guildId);
    db.prepare(`UPDATE fanart_settings SET ${field} = ? WHERE guild_id = ?`).run(value, guildId);
    return true;
  } catch (err) { console.error('[DB] updateFanArtSetting failed:', err); return false; }
}

// ── Stream Notifications CRUD ──

/** Tambah stream notification config */
export function addStreamNotification(
  guildId: string, platform: string, platformUser: string,
  notifyChannel: string, pingRole: string | null, customMessage: string | null,
): boolean {
  if (!STREAM_PLATFORMS.includes(platform)) throw new Error(`Platform tidak valid: ${platform}`);
  try {
    getDb().prepare(`
      INSERT INTO stream_notifications (guild_id, platform, platform_user, notify_channel, ping_role, custom_message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(guildId, platform, platformUser, notifyChannel, pingRole, customMessage);
    return true;
  } catch (err) { console.error('[DB] addStreamNotification failed:', err); return false; }
}

/** Hapus stream notification config — pastikan milik guild yang sama */
export function deleteStreamNotification(id: number, guildId: string): boolean {
  try {
    const result = getDb().prepare('DELETE FROM stream_notifications WHERE id = ? AND guild_id = ?').run(id, guildId);
    return result.changes > 0;
  } catch (err) { console.error('[DB] deleteStreamNotification failed:', err); return false; }
}

// ── Schedule CRUD ──

/** Tambah jadwal streaming */
export function addScheduleEntry(
  guildId: string, dayOfWeek: number, time: string,
  timezone: string, title: string, description: string | null,
  eventId: string | null = null,
): boolean {
  if (dayOfWeek < 0 || dayOfWeek > 6) throw new Error('Day of week harus 0-6');
  try {
    getDb().prepare(`
      INSERT INTO stream_schedule (guild_id, day_of_week, time, timezone, title, description, event_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(guildId, dayOfWeek, time, timezone, title, description, eventId);
    return true;
  } catch (err) { console.error('[DB] addScheduleEntry failed:', err); return false; }
}

/** Hapus jadwal streaming — pastikan milik guild yang sama, dan kembalikan data entry-nya agar event_id bisa didapat */
export function deleteScheduleEntry(id: number, guildId: string): any {
  try {
    const entry = getDb().prepare('SELECT * FROM stream_schedule WHERE id = ? AND guild_id = ?').get(id, guildId);
    if (!entry) return null;
    
    const result = getDb().prepare('DELETE FROM stream_schedule WHERE id = ? AND guild_id = ?').run(id, guildId);
    return result.changes > 0 ? entry : null;
  } catch (err) { console.error('[DB] deleteScheduleEntry failed:', err); return null; }
}

// ── Fan Art CRUD ──

/** Hapus fan art submission — pastikan milik guild yang sama */
export function deleteFanArt(id: number, guildId: string): boolean {
  try {
    const result = getDb().prepare('DELETE FROM fanart_submissions WHERE id = ? AND guild_id = ?').run(id, guildId);
    return result.changes > 0;
  } catch (err) { console.error('[DB] deleteFanArt failed:', err); return false; }
}

