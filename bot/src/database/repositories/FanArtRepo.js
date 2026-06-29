/**
 * LumigiaBOT — Repository Fan Art Gallery
 * Mengelola submission, approval, dan gallery fan art.
 */

export default class FanArtRepo {
  /**
   * @param {import('better-sqlite3').Database} db
   */
  constructor(db) {
    this.db = db;

    // ── Settings ──
    this.stmtGetSettings = db.prepare('SELECT * FROM fanart_settings WHERE guild_id = ?');
    this.stmtUpsertSettings = db.prepare(`
      INSERT INTO fanart_settings (guild_id, enabled, submit_channel, gallery_channel, approval_required, vote_emoji)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(guild_id) DO UPDATE SET
        enabled = excluded.enabled,
        submit_channel = excluded.submit_channel,
        gallery_channel = excluded.gallery_channel,
        approval_required = excluded.approval_required,
        vote_emoji = excluded.vote_emoji
    `);

    // ── Submissions ──
    this.stmtSubmit = db.prepare(`
      INSERT INTO fanart_submissions (guild_id, user_id, image_url, title, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    this.stmtGet = db.prepare('SELECT * FROM fanart_submissions WHERE id = ?');
    this.stmtGetByGuild = db.prepare(
      'SELECT * FROM fanart_submissions WHERE guild_id = ? ORDER BY created_at DESC LIMIT ?'
    );
    this.stmtGetPending = db.prepare(
      'SELECT * FROM fanart_submissions WHERE guild_id = ? AND status = ? ORDER BY created_at'
    );
    this.stmtGetGallery = db.prepare(
      'SELECT * FROM fanart_submissions WHERE guild_id = ? AND status = ? ORDER BY votes DESC LIMIT ?'
    );
    this.stmtApprove = db.prepare(`
      UPDATE fanart_submissions SET status = 'approved', reviewed_by = ?, reviewed_at = datetime('now')
      WHERE id = ?
    `);
    this.stmtReject = db.prepare(`
      UPDATE fanart_submissions SET status = 'rejected', reviewed_by = ?, reviewed_at = datetime('now')
      WHERE id = ?
    `);
    this.stmtSetGalleryMessage = db.prepare(
      'UPDATE fanart_submissions SET gallery_message_id = ? WHERE id = ?'
    );
    this.stmtSetSubmitMessage = db.prepare(
      'UPDATE fanart_submissions SET message_id = ? WHERE id = ?'
    );
    this.stmtIncrementVotes = db.prepare(
      'UPDATE fanart_submissions SET votes = votes + 1 WHERE id = ?'
    );
    this.stmtDecrementVotes = db.prepare(
      'UPDATE fanart_submissions SET votes = MAX(0, votes - 1) WHERE id = ?'
    );
    this.stmtDelete = db.prepare('DELETE FROM fanart_submissions WHERE id = ?');
    this.stmtCountByUser = db.prepare(
      "SELECT COUNT(*) as count FROM fanart_submissions WHERE guild_id = ? AND user_id = ? AND status != 'rejected'"
    );

    // ── Per-user Vote Tracking ──
    this.stmtAddVote = db.prepare(
      'INSERT OR IGNORE INTO fanart_votes (submission_id, user_id) VALUES (?, ?)'
    );
    this.stmtRemoveVote = db.prepare(
      'DELETE FROM fanart_votes WHERE submission_id = ? AND user_id = ?'
    );
    this.stmtHasVoted = db.prepare(
      'SELECT 1 FROM fanart_votes WHERE submission_id = ? AND user_id = ?'
    );
    this.stmtGetVoteCount = db.prepare(
      'SELECT COUNT(*) as count FROM fanart_votes WHERE submission_id = ?'
    );
  }

  // ── Settings ──

  /** @returns {object|undefined} */
  getSettings(guildId) {
    return this.stmtGetSettings.get(guildId);
  }

  /** Update settings */
  setSettings(guildId, { enabled, submitChannel, galleryChannel, approvalRequired, voteEmoji }) {
    this.stmtUpsertSettings.run(
      guildId,
      enabled ? 1 : 0,
      submitChannel || null,
      galleryChannel || null,
      approvalRequired ? 1 : 0,
      voteEmoji || '⭐',
    );
  }

  // ── Submissions ──

  /**
   * Submit fan art baru.
   * @returns {number} ID submission
   */
  submit(guildId, userId, imageUrl, title = null, description = null) {
    const result = this.stmtSubmit.run(guildId, userId, imageUrl, title, description);
    return result.lastInsertRowid;
  }

  /** @returns {object|undefined} */
  get(id) { return this.stmtGet.get(id); }

  /** @returns {object[]} Semua submissions */
  getByGuild(guildId, limit = 50) { return this.stmtGetByGuild.all(guildId, limit); }

  /** @returns {object[]} Submissions pending approval */
  getPending(guildId) { return this.stmtGetPending.all(guildId, 'pending'); }

  /** @returns {object[]} Approved submissions sorted by votes */
  getGallery(guildId, limit = 25) { return this.stmtGetGallery.all(guildId, 'approved', limit); }

  /** Approve submission */
  approve(id, reviewerId) { this.stmtApprove.run(reviewerId, id); }

  /** Reject submission */
  reject(id, reviewerId) { this.stmtReject.run(reviewerId, id); }

  /** Set message IDs */
  setGalleryMessage(id, messageId) { this.stmtSetGalleryMessage.run(messageId, id); }
  setSubmitMessage(id, messageId) { this.stmtSetSubmitMessage.run(messageId, id); }

  /** Vote counter (denormalized cache on fanart_submissions) */
  incrementVotes(id) { this.stmtIncrementVotes.run(id); }
  decrementVotes(id) { this.stmtDecrementVotes.run(id); }

  // ── Per-user Vote Tracking ──

  /**
   * Toggle vote untuk submission. Return true jika vote ditambahkan, false jika dicabut.
   * @param {number} submissionId
   * @param {string} userId
   * @returns {boolean} true = voted, false = unvoted
   */
  toggleVote(submissionId, userId) {
    if (this.hasVoted(submissionId, userId)) {
      this.stmtRemoveVote.run(submissionId, userId);
      this.stmtDecrementVotes.run(submissionId);
      return false;
    }
    this.stmtAddVote.run(submissionId, userId);
    this.stmtIncrementVotes.run(submissionId);
    return true;
  }

  /** @returns {boolean} Apakah user sudah vote */
  hasVoted(submissionId, userId) {
    return !!this.stmtHasVoted.get(submissionId, userId);
  }

  /** @returns {number} Total vote untuk submission */
  getVoteCount(submissionId) {
    return this.stmtGetVoteCount.get(submissionId).count;
  }

  /** Hapus submission */
  delete(id) { return this.stmtDelete.run(id).changes > 0; }

  /** @returns {number} Jumlah submissions by user */
  countByUser(guildId, userId) { return this.stmtCountByUser.get(guildId, userId).count; }
}
