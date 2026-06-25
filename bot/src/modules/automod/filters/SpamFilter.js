/**
 * LumigiaBOT — Filter Spam
 * Mendeteksi spam pesan cepat dan konten duplikat per pengguna.
 * Melacak pesan di memori menggunakan Map dengan kunci userId.
 */

import { AutoModDefaults } from '../../../config/constants.js';

export default class SpamFilter {
  constructor() {
    /** @type {Map<string, Array<{ content: string, timestamp: number }>>} */
    this.messageCache = new Map();
  }

  /**
   * Periksa sebuah pesan untuk pola spam.
   *
   * @param {import('discord.js').Message} message
   * @param {object} config - Pengaturan filter khusus per-server
   * @returns {{ triggered: boolean, reason: string }}
   */
  check(message, config = {}) {
    const userId = message.author.id;
    const now = Date.now();
    const maxMessages = config.maxMessages ?? AutoModDefaults.SPAM_MAX_MESSAGES;
    const timeframe = config.timeframe ?? AutoModDefaults.SPAM_TIMEFRAME;
    const maxDuplicates = config.maxDuplicates ?? AutoModDefaults.SPAM_MAX_DUPLICATES;

    // Inisialisasi entri pengguna jika diperlukan
    if (!this.messageCache.has(userId)) {
      this.messageCache.set(userId, []);
    }

    const userMessages = this.messageCache.get(userId);

    // Tambahkan pesan saat ini
    userMessages.push({ content: message.content, timestamp: now });

    // Hapus pesan di luar jangka waktu
    const recentMessages = userMessages.filter((m) => now - m.timestamp < timeframe);
    this.messageCache.set(userId, recentMessages);

    // Pemeriksaan 1: Pesan bertubi-tubi
    if (recentMessages.length > maxMessages) {
      return {
        triggered: true,
        reason: `Sent ${recentMessages.length} messages in ${timeframe / 1000}s (limit: ${maxMessages})`,
      };
    }

    // Pemeriksaan 2: Konten duplikat
    const contentCounts = new Map();
    for (const msg of recentMessages) {
      const lower = msg.content.toLowerCase().trim();
      if (!lower) continue;
      contentCounts.set(lower, (contentCounts.get(lower) || 0) + 1);
    }

    for (const [content, count] of contentCounts) {
      if (count > maxDuplicates) {
        return {
          triggered: true,
          reason: `Sent duplicate message ${count} times (limit: ${maxDuplicates})`,
        };
      }
    }

    return { triggered: false, reason: '' };
  }
}
