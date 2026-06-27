/**
 * LumigiaBOT — Repository Stream Notifications
 * Mengelola konfigurasi notifikasi live streaming (Twitch/YouTube).
 */

export default class StreamNotifRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    this.db = db;

    this.stmtAdd = db.prepare(`
      INSERT OR REPLACE INTO stream_notifications
        (guild_id, platform, platform_user, notify_channel, ping_role, custom_message)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    this.stmtGet = db.prepare('SELECT * FROM stream_notifications WHERE id = ?');
    this.stmtGetByGuild = db.prepare('SELECT * FROM stream_notifications WHERE guild_id = ?');
    this.stmtGetByPlatform = db.prepare('SELECT * FROM stream_notifications WHERE platform = ?');
    this.stmtGetAll = db.prepare('SELECT * FROM stream_notifications');
    this.stmtDelete = db.prepare('DELETE FROM stream_notifications WHERE id = ?');
    this.stmtDeleteByGuild = db.prepare(
      'DELETE FROM stream_notifications WHERE guild_id = ? AND platform = ? AND platform_user = ?'
    );
    this.stmtSetLive = db.prepare(
      'UPDATE stream_notifications SET is_live = ?, last_stream_id = ? WHERE id = ?'
    );
    this.stmtSetAllOffline = db.prepare(
      'UPDATE stream_notifications SET is_live = 0 WHERE platform = ? AND platform_user = ?'
    );
  }

  /**
   * Tambah atau update notifikasi stream.
   * @param {string} guildId
   * @param {'twitch'|'youtube'} platform
   * @param {string} platformUser - Username (Twitch) atau channel ID (YouTube)
   * @param {string} notifyChannel - Discord channel ID
   * @param {string|null} pingRole - Role ID untuk di-ping
   * @param {string|null} customMessage
   */
  add(guildId, platform, platformUser, notifyChannel, pingRole = null, customMessage = null) {
    this.stmtAdd.run(guildId, platform, platformUser.toLowerCase(), notifyChannel, pingRole, customMessage);
  }

  /** @returns {object|undefined} */
  get(id) { return this.stmtGet.get(id); }

  /** @returns {object[]} Semua notifikasi untuk guild */
  getByGuild(guildId) { return this.stmtGetByGuild.all(guildId); }

  /** @returns {object[]} Semua notifikasi untuk platform tertentu */
  getByPlatform(platform) { return this.stmtGetByPlatform.all(platform); }

  /** @returns {object[]} Semua notifikasi */
  getAll() { return this.stmtGetAll.all(); }

  /** Hapus notifikasi by ID */
  delete(id) { return this.stmtDelete.run(id).changes > 0; }

  /** Hapus notifikasi by guild, platform, user */
  deleteByGuild(guildId, platform, platformUser) {
    return this.stmtDeleteByGuild.run(guildId, platform, platformUser.toLowerCase()).changes > 0;
  }

  /**
   * Update status live dan stream ID terakhir.
   * @param {number} id
   * @param {boolean} isLive
   * @param {string|null} streamId
   */
  setLiveStatus(id, isLive, streamId = null) {
    this.stmtSetLive.run(isLive ? 1 : 0, streamId, id);
  }

  /** Set semua notifikasi offline untuk platform user */
  setAllOffline(platform, platformUser) {
    this.stmtSetAllOffline.run(platform, platformUser.toLowerCase());
  }
}
