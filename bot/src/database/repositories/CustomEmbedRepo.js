/**
 * LumigiaBOT — Repository Custom Embeds & Social Links
 * Mengelola stored embeds dan profil sosial media server.
 */

export default class CustomEmbedRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    this.db = db;

    // ── Custom Embeds ──
    this.stmtCreate = db.prepare(`
      INSERT INTO custom_embeds (guild_id, name, embed_data) VALUES (?, ?, ?)
    `);
    this.stmtGet = db.prepare('SELECT * FROM custom_embeds WHERE id = ?');
    this.stmtGetByName = db.prepare('SELECT * FROM custom_embeds WHERE guild_id = ? AND name = ?');
    this.stmtGetByGuild = db.prepare('SELECT * FROM custom_embeds WHERE guild_id = ? ORDER BY created_at DESC');
    this.stmtUpdate = db.prepare('UPDATE custom_embeds SET embed_data = ? WHERE id = ?');
    this.stmtSetMessage = db.prepare('UPDATE custom_embeds SET channel_id = ?, message_id = ? WHERE id = ?');
    this.stmtDelete = db.prepare('DELETE FROM custom_embeds WHERE id = ?');
    this.stmtDeleteByName = db.prepare('DELETE FROM custom_embeds WHERE guild_id = ? AND name = ?');

    // ── Social Links ──
    this.stmtGetSocials = db.prepare('SELECT * FROM social_links WHERE guild_id = ?');
    this.stmtUpsertSocials = db.prepare(`
      INSERT INTO social_links (guild_id, twitch, youtube, tiktok, twitter, instagram, website, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(guild_id) DO UPDATE SET
        twitch = excluded.twitch,
        youtube = excluded.youtube,
        tiktok = excluded.tiktok,
        twitter = excluded.twitter,
        instagram = excluded.instagram,
        website = excluded.website,
        updated_at = datetime('now')
    `);
  }

  // ── Custom Embeds ──

  /**
   * Buat embed baru.
   * @param {string} guildId
   * @param {string} name - Nama unik embed
   * @param {object} embedData - Data embed (title, description, color, fields, etc.)
   * @returns {number} ID embed
   */
  createEmbed(guildId, name, embedData) {
    const result = this.stmtCreate.run(guildId, name, JSON.stringify(embedData));
    return result.lastInsertRowid;
  }

  /** @returns {object|undefined} */
  getEmbed(id) {
    const row = this.stmtGet.get(id);
    if (row) row.embed_data = JSON.parse(row.embed_data);
    return row;
  }

  /** @returns {object|undefined} */
  getEmbedByName(guildId, name) {
    const row = this.stmtGetByName.get(guildId, name);
    if (row) row.embed_data = JSON.parse(row.embed_data);
    return row;
  }

  /** @returns {object[]} */
  getEmbedsByGuild(guildId) {
    return this.stmtGetByGuild.all(guildId).map(row => {
      row.embed_data = JSON.parse(row.embed_data);
      return row;
    });
  }

  /** Update embed data */
  updateEmbed(id, embedData) {
    this.stmtUpdate.run(JSON.stringify(embedData), id);
  }

  /** Set channel dan message ID setelah embed dikirim */
  setEmbedMessage(id, channelId, messageId) {
    this.stmtSetMessage.run(channelId, messageId, id);
  }

  /** Hapus embed */
  deleteEmbed(id) {
    return this.stmtDelete.run(id).changes > 0;
  }

  /** Hapus embed by name */
  deleteEmbedByName(guildId, name) {
    return this.stmtDeleteByName.run(guildId, name).changes > 0;
  }

  // ── Social Links ──

  /** @returns {object|undefined} */
  getSocials(guildId) {
    return this.stmtGetSocials.get(guildId);
  }

  /** Upsert semua social links sekaligus */
  setSocials(guildId, { twitch, youtube, tiktok, twitter, instagram, website }) {
    this.stmtUpsertSocials.run(
      guildId,
      twitch || null,
      youtube || null,
      tiktok || null,
      twitter || null,
      instagram || null,
      website || null,
    );
  }
}
