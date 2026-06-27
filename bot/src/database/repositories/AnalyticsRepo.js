/**
 * LumigiaBOT — Repository Analytics
 * Mengelola daily stats dan channel activity untuk dashboard analytics.
 */

export default class AnalyticsRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    this.db = db;

    // ── Daily Stats ──
    this.stmtIncrMessages = db.prepare(`
      INSERT INTO daily_stats (guild_id, date, messages, active_users)
      VALUES (?, date('now'), 1, 0)
      ON CONFLICT(guild_id, date) DO UPDATE SET messages = daily_stats.messages + 1
    `);
    this.stmtIncrJoined = db.prepare(`
      INSERT INTO daily_stats (guild_id, date, members_joined)
      VALUES (?, date('now'), 1)
      ON CONFLICT(guild_id, date) DO UPDATE SET members_joined = daily_stats.members_joined + 1
    `);
    this.stmtIncrLeft = db.prepare(`
      INSERT INTO daily_stats (guild_id, date, members_left)
      VALUES (?, date('now'), 1)
      ON CONFLICT(guild_id, date) DO UPDATE SET members_left = daily_stats.members_left + 1
    `);
    this.stmtSetActiveUsers = db.prepare(`
      INSERT INTO daily_stats (guild_id, date, active_users)
      VALUES (?, date('now'), ?)
      ON CONFLICT(guild_id, date) DO UPDATE SET active_users = excluded.active_users
    `);
    this.stmtGetDailyStats = db.prepare(`
      SELECT * FROM daily_stats WHERE guild_id = ? AND date >= date('now', ?)
      ORDER BY date
    `);
    this.stmtGetStatsToday = db.prepare(
      "SELECT * FROM daily_stats WHERE guild_id = ? AND date = date('now')"
    );

    // ── Channel Activity ──
    this.stmtIncrChannel = db.prepare(`
      INSERT INTO channel_activity (guild_id, channel_id, date, messages)
      VALUES (?, ?, date('now'), 1)
      ON CONFLICT(guild_id, channel_id, date) DO UPDATE SET messages = channel_activity.messages + 1
    `);
    this.stmtGetChannelActivity = db.prepare(`
      SELECT channel_id, SUM(messages) as total_messages
      FROM channel_activity
      WHERE guild_id = ? AND date >= date('now', ?)
      GROUP BY channel_id
      ORDER BY total_messages DESC
      LIMIT ?
    `);
    this.stmtGetChannelDaily = db.prepare(`
      SELECT * FROM channel_activity
      WHERE guild_id = ? AND channel_id = ? AND date >= date('now', ?)
      ORDER BY date
    `);
  }

  // ── Daily Stats ──

  /** Increment message count untuk hari ini */
  trackMessage(guildId) {
    this.stmtIncrMessages.run(guildId);
  }

  /** Increment member joined count */
  trackMemberJoin(guildId) {
    this.stmtIncrJoined.run(guildId);
  }

  /** Increment member left count */
  trackMemberLeave(guildId) {
    this.stmtIncrLeft.run(guildId);
  }

  /** Set active users count */
  setActiveUsers(guildId, count) {
    this.stmtSetActiveUsers.run(guildId, count);
  }

  /**
   * Get daily stats untuk rentang waktu.
   * @param {string} guildId
   * @param {number} days - Jumlah hari ke belakang (default 30)
   * @returns {object[]}
   */
  getDailyStats(guildId, days = 30) {
    return this.stmtGetDailyStats.all(guildId, `-${days} days`);
  }

  /** @returns {object|undefined} Stats hari ini */
  getStatsToday(guildId) {
    return this.stmtGetStatsToday.get(guildId);
  }

  // ── Channel Activity ──

  /** Track pesan di channel tertentu */
  trackChannelMessage(guildId, channelId) {
    this.stmtIncrChannel.run(guildId, channelId);
  }

  /**
   * Get top channels by message count.
   * @param {string} guildId
   * @param {number} days - Jumlah hari ke belakang
   * @param {number} limit - Jumlah channel
   * @returns {object[]}
   */
  getTopChannels(guildId, days = 7, limit = 10) {
    return this.stmtGetChannelActivity.all(guildId, `-${days} days`, limit);
  }

  /**
   * Get daily activity untuk channel tertentu.
   * @param {string} guildId
   * @param {string} channelId
   * @param {number} days
   * @returns {object[]}
   */
  getChannelDaily(guildId, channelId, days = 30) {
    return this.stmtGetChannelDaily.all(guildId, channelId, `-${days} days`);
  }
}
