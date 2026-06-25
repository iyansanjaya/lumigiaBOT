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
    db = new Database(DB_PATH, { readonly: true, fileMustExist: true });
    db.pragma('journal_mode = WAL');
  }
  return db;
}

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
