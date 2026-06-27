/**
 * LumigiaBOT — Repository Voice Channel Sementara
 * Lapisan akses data untuk tabel voice_settings dan temp_channels.
 */

export default class VoiceRepo {
  /** @param {import('better-sqlite3').Database} db */
  constructor(db) {
    this.db = db;

    // ── voice_settings statements ──
    this._getSettings = db.prepare('SELECT * FROM voice_settings WHERE guild_id = ?');
    this._upsertSettings = db.prepare(`
      INSERT INTO voice_settings (guild_id, hub_channel_id, category_id)
      VALUES (?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET
        hub_channel_id = excluded.hub_channel_id,
        category_id = excluded.category_id
    `);
    this._deleteSettings = db.prepare('DELETE FROM voice_settings WHERE guild_id = ?');

    // ── temp_channels statements ──
    this._addTempChannel = db.prepare(`
      INSERT INTO temp_channels (channel_id, guild_id, owner_id, name)
      VALUES (?, ?, ?, ?)
    `);
    this._removeTempChannel = db.prepare('DELETE FROM temp_channels WHERE channel_id = ?');
    this._getTempChannel = db.prepare('SELECT * FROM temp_channels WHERE channel_id = ?');
    this._getTempChannelsByGuild = db.prepare('SELECT * FROM temp_channels WHERE guild_id = ?');
    this._getTempChannelByOwner = db.prepare(
      'SELECT * FROM temp_channels WHERE guild_id = ? AND owner_id = ?'
    );
    this._clearGuildTempChannels = db.prepare('DELETE FROM temp_channels WHERE guild_id = ?');
  }

  // ════════════════════════════════════════════════
  //  voice_settings
  // ════════════════════════════════════════════════

  /**
   * Mendapatkan pengaturan voice untuk guild.
   * @param {string} guildId
   * @returns {object|undefined}
   */
  getSettings(guildId) {
    return this._getSettings.get(guildId);
  }

  /**
   * Upsert pengaturan voice — membuat atau memperbarui hub dan kategori.
   * @param {string} guildId
   * @param {string} hubChannelId
   * @param {string} categoryId
   */
  setSettings(guildId, hubChannelId, categoryId) {
    this._upsertSettings.run(guildId, hubChannelId, categoryId);
  }

  /**
   * Memperbarui satu field pengaturan voice.
   * Hanya field yang ada di whitelist yang diizinkan.
   * @param {string} guildId
   * @param {string} field
   * @param {*} value
   */
  updateSetting(guildId, field, value) {
    const allowedFields = [
      'enabled', 'default_limit', 'default_name',
      'hub_channel_id', 'category_id',
    ];

    if (!allowedFields.includes(field)) {
      throw new Error(`Invalid voice setting field: ${field}`);
    }

    const stmt = this.db.prepare(
      `UPDATE voice_settings SET ${field} = ? WHERE guild_id = ?`
    );
    stmt.run(value, guildId);
  }

  /**
   * Menghapus pengaturan voice untuk guild.
   * @param {string} guildId
   */
  deleteSettings(guildId) {
    this._deleteSettings.run(guildId);
  }

  // ════════════════════════════════════════════════
  //  temp_channels
  // ════════════════════════════════════════════════

  /**
   * Menambahkan channel sementara baru ke database.
   * @param {string} channelId
   * @param {string} guildId
   * @param {string} ownerId
   * @param {string} name
   */
  addTempChannel(channelId, guildId, ownerId, name) {
    this._addTempChannel.run(channelId, guildId, ownerId, name);
  }

  /**
   * Menghapus channel sementara dari database.
   * @param {string} channelId
   */
  removeTempChannel(channelId) {
    this._removeTempChannel.run(channelId);
  }

  /**
   * Mendapatkan data channel sementara berdasarkan ID channel.
   * @param {string} channelId
   * @returns {object|undefined}
   */
  getTempChannel(channelId) {
    return this._getTempChannel.get(channelId);
  }

  /**
   * Mendapatkan semua channel sementara untuk guild.
   * @param {string} guildId
   * @returns {object[]}
   */
  getTempChannelsByGuild(guildId) {
    return this._getTempChannelsByGuild.all(guildId);
  }

  /**
   * Mendapatkan channel sementara milik user di guild.
   * @param {string} guildId
   * @param {string} ownerId
   * @returns {object|undefined}
   */
  getTempChannelByOwner(guildId, ownerId) {
    return this._getTempChannelByOwner.get(guildId, ownerId);
  }

  /**
   * Memperbarui satu field pada channel sementara.
   * Hanya field yang ada di whitelist yang diizinkan.
   * @param {string} channelId
   * @param {string} field
   * @param {*} value
   */
  updateTempChannel(channelId, field, value) {
    const allowedFields = ['name', 'user_limit', 'locked'];

    if (!allowedFields.includes(field)) {
      throw new Error(`Invalid temp channel field: ${field}`);
    }

    const stmt = this.db.prepare(
      `UPDATE temp_channels SET ${field} = ? WHERE channel_id = ?`
    );
    stmt.run(value, channelId);
  }

  /**
   * Membersihkan channel sementara yang sudah tidak ada di Discord.
   * Menghapus semua channel yang ID-nya tidak ada di daftar existingChannelIds.
   * @param {string} guildId
   * @param {string[]} existingChannelIds - ID channel yang masih ada di Discord
   */
  cleanupStaleChannels(guildId, existingChannelIds) {
    const channels = this._getTempChannelsByGuild.all(guildId);

    const removeStale = this.db.transaction(() => {
      for (const ch of channels) {
        if (!existingChannelIds.includes(ch.channel_id)) {
          this._removeTempChannel.run(ch.channel_id);
        }
      }
    });

    removeStale();
  }
}
