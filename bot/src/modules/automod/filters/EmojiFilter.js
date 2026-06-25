/**
 * LumigiaBOT — Filter Emoji
 * Mendeteksi pesan dengan penggunaan emoji yang berlebihan (baik unicode maupun kustom).
 */

import { AutoModDefaults } from '../../../config/constants.js';

/** Mencocokkan emoji unicode (cakupan luas) */
const UNICODE_EMOJI_REGEX = /\p{Extended_Pictographic}/gu;

/** Mencocokkan emoji kustom Discord: <:name:id> atau <a:name:id> */
const CUSTOM_EMOJI_REGEX = /<a?:\w+:\d+>/g;

export default class EmojiFilter {
  /**
   * Memeriksa pesan untuk penggunaan emoji yang berlebihan.
   *
   * @param {import('discord.js').Message} message
   * @param {object} config - Override konfigurasi filter per-guild
   * @returns {{ triggered: boolean, reason: string }}
   */
  check(message, config = {}) {
    const content = message.content;
    if (!content) return { triggered: false, reason: '' };

    const maxEmoji = config.maxEmoji ?? AutoModDefaults.EMOJI_MAX;

    // Hitung emoji unicode
    const unicodeMatches = content.match(UNICODE_EMOJI_REGEX) || [];

    // Hitung emoji kustom Discord
    const customMatches = content.match(CUSTOM_EMOJI_REGEX) || [];

    const totalEmoji = unicodeMatches.length + customMatches.length;

    if (totalEmoji > maxEmoji) {
      return {
        triggered: true,
        reason: `${totalEmoji} emoji used (limit: ${maxEmoji})`,
      };
    }

    return { triggered: false, reason: '' };
  }
}
