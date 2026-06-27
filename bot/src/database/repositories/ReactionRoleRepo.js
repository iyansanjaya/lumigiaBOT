/**
 * LumigiaBOT — Repository Reaction Role
 * Mengelola panel reaction role dan entri role yang terkait.
 */

export default class ReactionRoleRepo {
  /** @param {import('better-sqlite3').Database} db */
  constructor(db) {
    this.db = db;

    // --- Panel Statements ---
    this._createPanel = db.prepare(`
      INSERT INTO reaction_role_panels (guild_id, channel_id, title, description, color, mode)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    this._getPanel = db.prepare('SELECT * FROM reaction_role_panels WHERE id = ?');
    this._getPanelByMessage = db.prepare('SELECT * FROM reaction_role_panels WHERE message_id = ?');
    this._getPanelsByGuild = db.prepare(
      'SELECT * FROM reaction_role_panels WHERE guild_id = ? ORDER BY created_at DESC'
    );
    this._updatePanelMessage = db.prepare(
      'UPDATE reaction_role_panels SET message_id = ? WHERE id = ?'
    );
    this._deletePanel = db.prepare('DELETE FROM reaction_role_panels WHERE id = ?');

    // --- Entry Statements ---
    this._addEntry = db.prepare(`
      INSERT INTO reaction_role_entries (panel_id, role_id, label, emoji, description, style)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    this._getEntries = db.prepare(
      'SELECT * FROM reaction_role_entries WHERE panel_id = ? ORDER BY id ASC'
    );
    this._removeEntry = db.prepare('DELETE FROM reaction_role_entries WHERE id = ?');
    this._getEntryByRole = db.prepare(
      'SELECT * FROM reaction_role_entries WHERE panel_id = ? AND role_id = ?'
    );
    this._getEntry = db.prepare('SELECT * FROM reaction_role_entries WHERE id = ?');
  }

  /**
   * Membuat panel reaction role baru.
   * @param {string} guildId
   * @param {string} channelId
   * @param {string} title
   * @param {string|null} description
   * @param {string} color
   * @param {string} mode
   * @returns {number} ID panel yang baru dibuat
   */
  createPanel(guildId, channelId, title, description, color, mode) {
    const result = this._createPanel.run(guildId, channelId, title, description, color, mode);
    return Number(result.lastInsertRowid);
  }

  /**
   * Mengambil panel berdasarkan ID.
   * @param {number} panelId
   * @returns {object|undefined}
   */
  getPanel(panelId) {
    return this._getPanel.get(panelId);
  }

  /**
   * Mengambil panel berdasarkan message_id.
   * @param {string} messageId
   * @returns {object|undefined}
   */
  getPanelByMessage(messageId) {
    return this._getPanelByMessage.get(messageId);
  }

  /**
   * Mengambil semua panel untuk sebuah guild.
   * @param {string} guildId
   * @returns {object[]}
   */
  getPanelsByGuild(guildId) {
    return this._getPanelsByGuild.all(guildId);
  }

  /**
   * Memperbarui message_id panel setelah embed dikirim.
   * @param {number} panelId
   * @param {string} messageId
   */
  updatePanelMessage(panelId, messageId) {
    return this._updatePanelMessage.run(messageId, panelId);
  }

  /**
   * Menghapus panel (CASCADE akan menghapus entri terkait).
   * @param {number} panelId
   */
  deletePanel(panelId) {
    return this._deletePanel.run(panelId);
  }

  /**
   * Menambahkan entri role ke panel.
   * @param {number} panelId
   * @param {string} roleId
   * @param {string} label
   * @param {string|null} emoji
   * @param {string|null} description
   * @param {string} style
   * @returns {number} ID entri yang baru dibuat
   */
  addEntry(panelId, roleId, label, emoji, description, style) {
    const result = this._addEntry.run(panelId, roleId, label, emoji, description, style);
    return Number(result.lastInsertRowid);
  }

  /**
   * Mengambil semua entri untuk sebuah panel.
   * @param {number} panelId
   * @returns {object[]}
   */
  getEntries(panelId) {
    return this._getEntries.all(panelId);
  }

  /**
   * Menghapus satu entri role.
   * @param {number} entryId
   */
  removeEntry(entryId) {
    return this._removeEntry.run(entryId);
  }

  /**
   * Mencari entri berdasarkan role dalam panel.
   * @param {number} panelId
   * @param {string} roleId
   * @returns {object|undefined}
   */
  getEntryByRole(panelId, roleId) {
    return this._getEntryByRole.get(panelId, roleId);
  }

  /**
   * Mengambil satu entri berdasarkan ID.
   * @param {number} entryId
   * @returns {object|undefined}
   */
  getEntry(entryId) {
    return this._getEntry.get(entryId);
  }
}
