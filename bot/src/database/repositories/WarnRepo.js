/**
 * LumigiaBOT — Repository Peringatan
 */

export default class WarnRepo {
  /** @param {import('better-sqlite3').Database} db */
  constructor(db) {
    this.db = db;

    this._add = db.prepare(`
      INSERT INTO warnings (guild_id, user_id, moderator_id, reason)
      VALUES (?, ?, ?, ?)
    `);
    this._getByUser = db.prepare(
      'SELECT * FROM warnings WHERE guild_id = ? AND user_id = ? ORDER BY created_at DESC'
    );
    this._countByUser = db.prepare(
      'SELECT COUNT(*) as count FROM warnings WHERE guild_id = ? AND user_id = ?'
    );
    this._deleteById = db.prepare(
      'DELETE FROM warnings WHERE id = ? AND guild_id = ?'
    );
    this._deleteByUser = db.prepare(
      'DELETE FROM warnings WHERE guild_id = ? AND user_id = ?'
    );
  }

  /** Menambahkan peringatan dan mengembalikan jumlah baru untuk pengguna. */
  add(guildId, userId, moderatorId, reason) {
    this._add.run(guildId, userId, moderatorId, reason);
    return this.count(guildId, userId);
  }

  /** Mendapatkan semua peringatan untuk pengguna di guild. */
  getByUser(guildId, userId) {
    return this._getByUser.all(guildId, userId);
  }

  /** Menghitung peringatan untuk pengguna. */
  count(guildId, userId) {
    return this._countByUser.get(guildId, userId).count;
  }

  /** Menghapus peringatan tertentu berdasarkan ID. */
  deleteById(id, guildId) {
    const result = this._deleteById.run(id, guildId);
    return result.changes > 0;
  }

  /** Menghapus semua peringatan untuk pengguna. Mengembalikan jumlah yang dihapus. */
  deleteByUser(guildId, userId) {
    const result = this._deleteByUser.run(guildId, userId);
    return result.changes;
  }
}
