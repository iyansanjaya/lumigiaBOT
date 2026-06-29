/**
 * LumigiaBOT — Repository Stream Schedule
 * Mengelola jadwal streaming dan pengaturan auto-post.
 */

export default class ScheduleRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    this.db = db;

    // ── Schedule Entries ──
    this.stmtAdd = db.prepare(`
      INSERT OR REPLACE INTO stream_schedule (guild_id, day_of_week, time, timezone, title, description, event_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    this.stmtRemove = db.prepare('DELETE FROM stream_schedule WHERE guild_id = ? AND day_of_week = ? AND time = ?');
    this.stmtGetByGuild = db.prepare('SELECT * FROM stream_schedule WHERE guild_id = ? ORDER BY day_of_week, time');
    this.stmtGetByDay = db.prepare('SELECT * FROM stream_schedule WHERE guild_id = ? AND day_of_week = ? ORDER BY time');
    this.stmtClearGuild = db.prepare('DELETE FROM stream_schedule WHERE guild_id = ?');
    this.stmtDeleteById = db.prepare('DELETE FROM stream_schedule WHERE id = ?');

    // ── Settings ──
    this.stmtGetSettings = db.prepare('SELECT * FROM schedule_settings WHERE guild_id = ?');
    this.stmtUpsertSettings = db.prepare(`
      INSERT INTO schedule_settings (guild_id, auto_post_channel, auto_post_enabled)
      VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET
        auto_post_channel = excluded.auto_post_channel,
        auto_post_enabled = excluded.auto_post_enabled
    `);
    this.stmtGetAutoPostGuilds = db.prepare('SELECT * FROM schedule_settings WHERE auto_post_enabled = 1');
  }

  /**
   * Tambah atau update jadwal.
   * @param {string} guildId
   * @param {number} dayOfWeek - 0=Minggu, 1=Senin, ..., 6=Sabtu
   * @param {string} time - Format HH:MM
   * @param {string} timezone
   * @param {string} title
   * @param {string|null} description
   * @param {string|null} eventId
   * @returns {number|bigint} inserted ID
   */
  addSchedule(guildId, dayOfWeek, time, timezone, title, description = null, eventId = null) {
    const info = this.stmtAdd.run(guildId, dayOfWeek, time, timezone, title, description, eventId);
    return info.lastInsertRowid;
  }

  /**
   * Hapus jadwal tertentu dan kembalikan datanya (agar tahu event_id).
   */
  removeSchedule(guildId, dayOfWeek, time) {
    const entry = this.db.prepare('SELECT * FROM stream_schedule WHERE guild_id = ? AND day_of_week = ? AND time = ?').get(guildId, dayOfWeek, time);
    if (!entry) return null;
    
    this.stmtRemove.run(guildId, dayOfWeek, time);
    return entry;
  }

  /** @returns {object[]} Semua jadwal untuk guild, urut hari lalu waktu */
  getByGuild(guildId) {
    return this.stmtGetByGuild.all(guildId);
  }

  /** @returns {object[]} Jadwal untuk hari tertentu */
  getByDay(guildId, dayOfWeek) {
    return this.stmtGetByDay.all(guildId, dayOfWeek);
  }

  /** Hapus semua jadwal guild */
  clearAll(guildId) {
    this.stmtClearGuild.run(guildId);
  }

  /** Hapus jadwal by ID */
  deleteById(id) {
    return this.stmtDeleteById.run(id).changes > 0;
  }

  // ── Settings ──

  /** @returns {object|undefined} */
  getSettings(guildId) {
    return this.stmtGetSettings.get(guildId);
  }

  /** Upsert settings */
  setSettings(guildId, autoPostChannel, autoPostEnabled) {
    this.stmtUpsertSettings.run(guildId, autoPostChannel, autoPostEnabled ? 1 : 0);
  }

  /** @returns {object[]} Semua guild dengan auto-post aktif */
  getAutoPostGuilds() {
    return this.stmtGetAutoPostGuilds.all();
  }
}
