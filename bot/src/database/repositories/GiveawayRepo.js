/**
 * LumigiaBOT — Repository Giveaway
 * Mengelola data giveaway dan entries peserta.
 */

import { logger } from '../../utils/Logger.js';

export default class GiveawayRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    this.db = db;

    // ── Prepared Statements ──
    this.stmtCreate = db.prepare(`
      INSERT INTO giveaways (guild_id, channel_id, prize, winners_count, required_role, host_id, ends_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    this.stmtGet = db.prepare('SELECT * FROM giveaways WHERE id = ?');
    this.stmtGetByMessage = db.prepare('SELECT * FROM giveaways WHERE message_id = ?');
    this.stmtGetByGuild = db.prepare('SELECT * FROM giveaways WHERE guild_id = ? ORDER BY created_at DESC LIMIT 25');
    this.stmtGetActive = db.prepare('SELECT * FROM giveaways WHERE ended = 0');
    this.stmtGetExpired = db.prepare(`SELECT * FROM giveaways WHERE ended = 0 AND ends_at <= datetime('now')`);
    this.stmtSetMessage = db.prepare('UPDATE giveaways SET message_id = ? WHERE id = ?');
    this.stmtEnd = db.prepare('UPDATE giveaways SET ended = 1, winner_ids = ? WHERE id = ?');
    this.stmtDelete = db.prepare('DELETE FROM giveaways WHERE id = ?');

    this.stmtAddEntry = db.prepare(`
      INSERT OR IGNORE INTO giveaway_entries (giveaway_id, user_id) VALUES (?, ?)
    `);
    this.stmtRemoveEntry = db.prepare('DELETE FROM giveaway_entries WHERE giveaway_id = ? AND user_id = ?');
    this.stmtGetEntries = db.prepare('SELECT user_id FROM giveaway_entries WHERE giveaway_id = ?');
    this.stmtCountEntries = db.prepare('SELECT COUNT(*) as count FROM giveaway_entries WHERE giveaway_id = ?');
    this.stmtHasEntered = db.prepare('SELECT 1 FROM giveaway_entries WHERE giveaway_id = ? AND user_id = ?');
  }

  /**
   * Buat giveaway baru.
   * @returns {number} ID giveaway yang dibuat
   */
  create(guildId, channelId, prize, winnersCount, requiredRole, hostId, endsAt) {
    const result = this.stmtCreate.run(guildId, channelId, prize, winnersCount, requiredRole, hostId, endsAt);
    return result.lastInsertRowid;
  }

  /** @returns {object|undefined} */
  get(id) { return this.stmtGet.get(id); }

  /** @returns {object|undefined} */
  getByMessage(messageId) { return this.stmtGetByMessage.get(messageId); }

  /** @returns {object[]} */
  getByGuild(guildId) { return this.stmtGetByGuild.all(guildId); }

  /** @returns {object[]} Semua giveaway yang belum selesai */
  getActive() { return this.stmtGetActive.all(); }

  /** @returns {object[]} Giveaway yang sudah expired tapi belum di-end */
  getExpired() { return this.stmtGetExpired.all(); }

  /** Set message_id setelah embed dikirim */
  setMessageId(id, messageId) { this.stmtSetMessage.run(messageId, id); }

  /** Akhiri giveaway dan set pemenang */
  end(id, winnerIds) {
    this.stmtEnd.run(JSON.stringify(winnerIds), id);
  }

  /** Hapus giveaway */
  delete(id) { this.stmtDelete.run(id); }

  // ── Entries ──

  /** Tambah peserta */
  addEntry(giveawayId, userId) {
    return this.stmtAddEntry.run(giveawayId, userId).changes > 0;
  }

  /** Hapus peserta */
  removeEntry(giveawayId, userId) {
    return this.stmtRemoveEntry.run(giveawayId, userId).changes > 0;
  }

  /** @returns {string[]} Daftar user_id peserta */
  getEntries(giveawayId) {
    return this.stmtGetEntries.all(giveawayId).map(r => r.user_id);
  }

  /** @returns {number} Jumlah peserta */
  countEntries(giveawayId) {
    return this.stmtCountEntries.get(giveawayId).count;
  }

  /** @returns {boolean} Apakah user sudah ikut */
  hasEntered(giveawayId, userId) {
    return !!this.stmtHasEntered.get(giveawayId, userId);
  }
}
