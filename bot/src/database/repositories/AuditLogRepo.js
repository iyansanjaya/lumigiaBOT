/**
 * LumigiaBOT — Repository Log Audit
 */

export default class AuditLogRepo {
  /** @param {import('better-sqlite3').Database} db */
  constructor(db) {
    this.db = db;

    this._add = db.prepare(`
      INSERT INTO audit_logs (guild_id, action, moderator_id, target_id, reason, details)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    this._getRecent = db.prepare(
      'SELECT * FROM audit_logs WHERE guild_id = ? ORDER BY created_at DESC LIMIT ?'
    );
    this._getByUser = db.prepare(
      'SELECT * FROM audit_logs WHERE guild_id = ? AND target_id = ? ORDER BY created_at DESC LIMIT ?'
    );
    this._getByAction = db.prepare(
      'SELECT * FROM audit_logs WHERE guild_id = ? AND action = ? ORDER BY created_at DESC LIMIT ?'
    );
    this._countByGuild = db.prepare(
      'SELECT COUNT(*) as count FROM audit_logs WHERE guild_id = ?'
    );
    this._getStats = db.prepare(`
      SELECT action, COUNT(*) as count
      FROM audit_logs WHERE guild_id = ?
      GROUP BY action ORDER BY count DESC
    `);
  }

  /** Mencatat aksi moderasi. */
  add(guildId, action, moderatorId, targetId, reason, details = null) {
    this._add.run(guildId, action, moderatorId, targetId, reason,
      details ? JSON.stringify(details) : null
    );
  }

  /** Mendapatkan entri log audit terbaru. */
  getRecent(guildId, limit = 10) {
    return this._getRecent.all(guildId, limit);
  }

  /** Mendapatkan log audit untuk pengguna tertentu. */
  getByUser(guildId, userId, limit = 10) {
    return this._getByUser.all(guildId, userId, limit);
  }

  /** Mendapatkan log audit untuk tipe aksi tertentu. */
  getByAction(guildId, action, limit = 10) {
    return this._getByAction.all(guildId, action, limit);
  }

  /** Menghitung total log audit untuk guild. */
  count(guildId) {
    return this._countByGuild.get(guildId).count;
  }

  /** Mendapatkan statistik rincian aksi. */
  getStats(guildId) {
    return this._getStats.all(guildId);
  }
}
