/**
 * LumigiaBOT — Repository Pengaturan Guild
 */

import { GUILD_SETTINGS_FIELDS, normalizeLanguage } from '../../../../shared/contracts.js';

export default class GuildSettingsRepo {
  /** @param {import('better-sqlite3').Database} db */
  constructor(db) {
    this.db = db;

    this._get = db.prepare('SELECT * FROM guild_settings WHERE guild_id = ?');
    this._upsert = db.prepare(`
      INSERT INTO guild_settings (guild_id) VALUES (?)
      ON CONFLICT(guild_id) DO NOTHING
    `);
    this._delete = db.prepare('DELETE FROM guild_settings WHERE guild_id = ?');
  }

  /** Mendapatkan pengaturan guild, membuat entri default jika belum ada. */
  get(guildId) {
    this.ensureExists(guildId);
    return this._get.get(guildId);
  }

  /** Memastikan entri guild ada dengan nilai default. */
  ensureExists(guildId) {
    this._upsert.run(guildId);
  }

  /** Memperbarui satu field untuk guild. */
  set(guildId, field, value) {
    this.ensureExists(guildId);
    if (!GUILD_SETTINGS_FIELDS.includes(field)) {
      throw new Error(`Invalid field: ${field}`);
    }

    if (field === 'language') {
      value = normalizeLanguage(value);
    }

    const stmt = this.db.prepare(
      `UPDATE guild_settings SET ${field} = ?, updated_at = datetime('now') WHERE guild_id = ?`
    );
    stmt.run(value, guildId);
  }

  /** Menghapus pengaturan guild (saat guild ditinggalkan). */
  delete(guildId) {
    this._delete.run(guildId);
  }
}
