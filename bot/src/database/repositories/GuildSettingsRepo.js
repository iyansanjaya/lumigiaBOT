/**
 * LumigiaBOT — Repository Pengaturan Guild
 */

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
    // Gunakan pendekatan aman: hanya izinkan field yang diketahui
    const allowedFields = [
      'language', 'mod_log_channel', 'automod_log_channel',
      'ticket_category', 'ticket_support_role', 'ticket_log_channel',
      'ticket_max_open', 'ticket_auto_close_hours', 'warn_escalation',
      'anti_raid_enabled', 'anti_raid_threshold', 'anti_raid_timeframe',
      'welcome_enabled', 'welcome_channel', 'welcome_message',
    ];

    if (!allowedFields.includes(field)) {
      throw new Error(`Invalid field: ${field}`);
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
