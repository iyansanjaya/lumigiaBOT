/**
 * LumigiaBOT — Filter Huruf Kapital
 * Mendeteksi pesan dengan penggunaan huruf kapital yang berlebihan.
 * Memerlukan panjang pesan minimum untuk menghindari kesalahan deteksi pada pesan pendek.
 */

import { AutoModDefaults } from '../../../config/constants.js';

export default class CapsFilter {
  /**
   * Memeriksa pesan untuk penggunaan huruf kapital yang berlebihan.
   *
   * @param {import('discord.js').Message} message
   * @param {object} config - Override konfigurasi filter per-guild
   * @returns {{ triggered: boolean, reason: string }}
   */
  check(message, config = {}) {
    const content = message.content;
    const threshold = config.threshold ?? AutoModDefaults.CAPS_THRESHOLD;
    const minLength = config.minLength ?? AutoModDefaults.CAPS_MIN_LENGTH;

    // Lewati pesan pendek
    if (!content || content.length < minLength) {
      return { triggered: false, reason: '' };
    }

    // Hanya hitung karakter alfabet
    const letters = content.replace(/[^a-zA-Z]/g, '');
    if (letters.length === 0) {
      return { triggered: false, reason: '' };
    }

    const upperCount = letters.replace(/[^A-Z]/g, '').length;
    const ratio = upperCount / letters.length;

    if (ratio > threshold) {
      const percentage = Math.round(ratio * 100);
      return {
        triggered: true,
        reason: `${percentage}% uppercase (threshold: ${Math.round(threshold * 100)}%)`,
      };
    }

    return { triggered: false, reason: '' };
  }
}
