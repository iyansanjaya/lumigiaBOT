/**
 * LumigiaBOT — Repository Tiket
 */

export default class TicketRepo {
  /** @param {import('better-sqlite3').Database} db */
  constructor(db) {
    this.db = db;

    this._create = db.prepare(`
      INSERT INTO tickets (guild_id, channel_id, user_id, category, reason)
      VALUES (?, ?, ?, ?, ?)
    `);
    this._getByChannel = db.prepare('SELECT * FROM tickets WHERE channel_id = ?');
    this._getOpenByUser = db.prepare(
      "SELECT * FROM tickets WHERE guild_id = ? AND user_id = ? AND status = 'open'"
    );
    this._countOpenByUser = db.prepare(
      "SELECT COUNT(*) as count FROM tickets WHERE guild_id = ? AND user_id = ? AND status IN ('open', 'claimed')"
    );
    this._close = db.prepare(`
      UPDATE tickets SET status = 'closed', closed_at = datetime('now'), closed_by = ?
      WHERE channel_id = ?
    `);
    this._claim = db.prepare("UPDATE tickets SET status = 'claimed', claimed_by = ? WHERE channel_id = ?");
    this._reopen = db.prepare("UPDATE tickets SET status = 'open', closed_at = NULL, closed_by = NULL WHERE channel_id = ?");
    this._getByGuild = db.prepare('SELECT * FROM tickets WHERE guild_id = ? ORDER BY created_at DESC LIMIT ?');
    this._getStatsByGuild = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'claimed' THEN 1 ELSE 0 END) as claimed,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed
      FROM tickets WHERE guild_id = ?
    `);
  }

  create(guildId, channelId, userId, category, reason) {
    return this._create.run(guildId, channelId, userId, category, reason);
  }

  getByChannel(channelId) {
    return this._getByChannel.get(channelId);
  }

  countOpenByUser(guildId, userId) {
    return this._countOpenByUser.get(guildId, userId).count;
  }

  close(channelId, closedBy) {
    return this._close.run(closedBy, channelId);
  }

  claim(channelId, claimedBy) {
    return this._claim.run(claimedBy, channelId);
  }

  reopen(channelId) {
    return this._reopen.run(channelId);
  }

  getByGuild(guildId, limit = 50) {
    return this._getByGuild.all(guildId, limit);
  }

  getStats(guildId) {
    return this._getStatsByGuild.get(guildId);
  }
}
