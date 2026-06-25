/**
 * LumigiaBOT — Filter Mention
 * Mendeteksi pesan dengan mention pengguna/role secara massal.
 */

import { AutoModDefaults } from '../../../config/constants.js';

export default class MentionFilter {
  /**
   * Memeriksa pesan untuk mention massal.
   *
   * @param {import('discord.js').Message} message
   * @param {object} config - Override konfigurasi filter per-guild
   * @returns {{ triggered: boolean, reason: string }}
   */
  check(message, config = {}) {
    const maxMentions = config.maxMentions ?? AutoModDefaults.MENTION_MAX;

    // Hitung mention pengguna dan role yang unik
    const userMentions = message.mentions.users.size;
    const roleMentions = message.mentions.roles.size;
    const totalMentions = userMentions + roleMentions;

    if (totalMentions > maxMentions) {
      return {
        triggered: true,
        reason: `${totalMentions} mentions (${userMentions} users, ${roleMentions} roles — limit: ${maxMentions})`,
      };
    }

    return { triggered: false, reason: '' };
  }
}
