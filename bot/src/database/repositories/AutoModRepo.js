/**
 * LumigiaBOT — Repository AutoMod
 */

import {
  AUTOMOD_WHITELIST_TYPES,
  isValidAutomodAction,
  isValidAutomodFilter,
} from '../../../../shared/contracts.js';

export default class AutoModRepo {
  /** @param {import('better-sqlite3').Database} db */
  constructor(db) {
    this.db = db;

    this._getFilter = db.prepare('SELECT * FROM automod_filters WHERE guild_id = ? AND filter_name = ?');
    this._getAllFilters = db.prepare('SELECT * FROM automod_filters WHERE guild_id = ?');
    this._upsertFilter = db.prepare(`
      INSERT INTO automod_filters (guild_id, filter_name, enabled, action, config)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(guild_id, filter_name) DO UPDATE SET
        enabled = excluded.enabled,
        action = excluded.action,
        config = excluded.config
    `);
    this._getWhitelist = db.prepare('SELECT * FROM automod_whitelist WHERE guild_id = ?');
    this._addWhitelist = db.prepare(`
      INSERT OR IGNORE INTO automod_whitelist (guild_id, type, target_id)
      VALUES (?, ?, ?)
    `);
    this._removeWhitelist = db.prepare(
      'DELETE FROM automod_whitelist WHERE guild_id = ? AND type = ? AND target_id = ?'
    );
    this._isWhitelisted = db.prepare(
      'SELECT 1 FROM automod_whitelist WHERE guild_id = ? AND (type = ? AND target_id = ?)'
    );
    this._getWords = db.prepare('SELECT * FROM word_filter WHERE guild_id = ?');
    this._addWord = db.prepare('INSERT OR IGNORE INTO word_filter (guild_id, word, is_regex) VALUES (?, ?, ?)');
    this._removeWord = db.prepare('DELETE FROM word_filter WHERE guild_id = ? AND word = ?');
  }

  getFilter(guildId, filterName) {
    return this._getFilter.get(guildId, filterName);
  }

  getAllFilters(guildId) {
    return this._getAllFilters.all(guildId);
  }

  setFilter(guildId, filterName, enabled, action, config = '{}') {
    if (!isValidAutomodFilter(filterName)) {
      throw new Error(`Invalid automod filter: ${filterName}`);
    }
    if (!isValidAutomodAction(action)) {
      throw new Error(`Invalid automod action: ${action}`);
    }

    this._upsertFilter.run(guildId, filterName, enabled ? 1 : 0, action, config);
  }

  getWhitelist(guildId) {
    return this._getWhitelist.all(guildId);
  }

  addWhitelist(guildId, type, targetId) {
    if (!AUTOMOD_WHITELIST_TYPES.includes(type)) {
      throw new Error(`Invalid automod whitelist type: ${type}`);
    }

    this._addWhitelist.run(guildId, type, targetId);
  }

  removeWhitelist(guildId, type, targetId) {
    if (!AUTOMOD_WHITELIST_TYPES.includes(type)) {
      throw new Error(`Invalid automod whitelist type: ${type}`);
    }

    return this._removeWhitelist.run(guildId, type, targetId).changes > 0;
  }

  isWhitelisted(guildId, type, targetId) {
    return !!this._isWhitelisted.get(guildId, type, targetId);
  }

  getWords(guildId) {
    return this._getWords.all(guildId);
  }

  addWord(guildId, word, isRegex = false) {
    this._addWord.run(guildId, word, isRegex ? 1 : 0);
  }

  removeWord(guildId, word) {
    return this._removeWord.run(guildId, word).changes > 0;
  }
}
