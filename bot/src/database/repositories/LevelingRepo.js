/**
 * LumigiaBOT — Repository Leveling & XP
 * Mengelola XP user, level, rewards, dan settings per guild.
 */

export default class LevelingRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    this.db = db;

    // ── User XP ──
    this.stmtGetUser = db.prepare('SELECT * FROM user_xp WHERE guild_id = ? AND user_id = ?');
    this.stmtAddXP = db.prepare(`
      INSERT INTO user_xp (guild_id, user_id, xp, level, messages, last_xp_at)
      VALUES (?, ?, ?, 0, 1, datetime('now'))
      ON CONFLICT(guild_id, user_id) DO UPDATE SET
        xp = user_xp.xp + excluded.xp,
        messages = user_xp.messages + 1,
        last_xp_at = datetime('now')
    `);
    this.stmtSetLevel = db.prepare('UPDATE user_xp SET level = ? WHERE guild_id = ? AND user_id = ?');
    this.stmtGetLeaderboard = db.prepare(
      'SELECT * FROM user_xp WHERE guild_id = ? ORDER BY xp DESC LIMIT ?'
    );
    this.stmtGetRank = db.prepare(`
      SELECT COUNT(*) + 1 as rank FROM user_xp
      WHERE guild_id = ? AND xp > (SELECT COALESCE(xp, 0) FROM user_xp WHERE guild_id = ? AND user_id = ?)
    `);
    this.stmtResetUser = db.prepare('DELETE FROM user_xp WHERE guild_id = ? AND user_id = ?');
    this.stmtResetGuild = db.prepare('DELETE FROM user_xp WHERE guild_id = ?');

    // ── Level Rewards ──
    this.stmtAddReward = db.prepare(`
      INSERT OR REPLACE INTO level_rewards (guild_id, level, role_id) VALUES (?, ?, ?)
    `);
    this.stmtRemoveReward = db.prepare('DELETE FROM level_rewards WHERE guild_id = ? AND level = ?');
    this.stmtGetRewards = db.prepare('SELECT * FROM level_rewards WHERE guild_id = ? ORDER BY level');
    this.stmtGetRewardForLevel = db.prepare('SELECT * FROM level_rewards WHERE guild_id = ? AND level = ?');
    this.stmtGetRewardsUpTo = db.prepare('SELECT * FROM level_rewards WHERE guild_id = ? AND level <= ? ORDER BY level');

    // ── Settings ──
    this.stmtGetSettings = db.prepare('SELECT * FROM leveling_settings WHERE guild_id = ?');
    this.stmtUpsertSettings = db.prepare(`
      INSERT INTO leveling_settings (guild_id, enabled) VALUES (?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET enabled = excluded.enabled
    `);

  }

  // ── User XP ──

  /** @returns {object|undefined} Data XP user */
  getUser(guildId, userId) {
    return this.stmtGetUser.get(guildId, userId);
  }

  /**
   * Tambah XP ke user. Auto-create jika belum ada.
   * @param {string} guildId
   * @param {string} userId
   * @param {number} xpAmount
   */
  addXP(guildId, userId, xpAmount) {
    this.stmtAddXP.run(guildId, userId, xpAmount);
  }

  /** Update level user */
  setLevel(guildId, userId, level) {
    this.stmtSetLevel.run(level, guildId, userId);
  }

  /**
   * @param {string} guildId
   * @param {number} limit - Default 10
   * @returns {object[]} Leaderboard sorted by XP desc
   */
  getLeaderboard(guildId, limit = 10) {
    return this.stmtGetLeaderboard.all(guildId, limit);
  }

  /**
   * @returns {number} Posisi rank user (1-based)
   */
  getRank(guildId, userId) {
    const result = this.stmtGetRank.get(guildId, guildId, userId);
    return result?.rank ?? 0;
  }

  /** Reset XP user tertentu */
  resetUser(guildId, userId) {
    this.stmtResetUser.run(guildId, userId);
  }

  /** Reset semua XP di guild */
  resetGuild(guildId) {
    this.stmtResetGuild.run(guildId);
  }

  // ── Level Rewards ──

  /** Tambah role reward untuk level tertentu */
  addReward(guildId, level, roleId) {
    this.stmtAddReward.run(guildId, level, roleId);
  }

  /** Hapus reward untuk level tertentu */
  removeReward(guildId, level) {
    return this.stmtRemoveReward.run(guildId, level).changes > 0;
  }

  /** @returns {object[]} Semua rewards untuk guild */
  getRewards(guildId) {
    return this.stmtGetRewards.all(guildId);
  }

  /** @returns {object|undefined} Reward untuk level tertentu */
  getRewardForLevel(guildId, level) {
    return this.stmtGetRewardForLevel.get(guildId, level);
  }

  /** @returns {object[]} Semua rewards sampai level tertentu */
  getRewardsUpTo(guildId, level) {
    return this.stmtGetRewardsUpTo.all(guildId, level);
  }

  // ── Settings ──

  /** @returns {object|undefined} */
  getSettings(guildId) {
    return this.stmtGetSettings.get(guildId);
  }

  /** Toggle enabled */
  setEnabled(guildId, enabled) {
    this.stmtUpsertSettings.run(guildId, enabled ? 1 : 0);
  }

  /**
   * Update specific setting field.
   * @param {string} guildId
   * @param {string} field - Must be one of allowed fields
   * @param {*} value
   */
  updateSetting(guildId, field, value) {
    const ALLOWED = new Set([
      'enabled', 'xp_per_message', 'xp_cooldown', 'multiplier',
      'multiplier_expires', 'announce_channel', 'ignored_channels', 'ignored_roles',
    ]);
    if (!ALLOWED.has(field)) throw new Error(`Field tidak diizinkan: ${field}`);

    // Use direct query since we can't use template in prepare
    this.db.prepare(`UPDATE leveling_settings SET ${field} = ? WHERE guild_id = ?`).run(value, guildId);
  }
}
