/**
 * LumigiaBOT — Filter Tautan
 * Mendeteksi tautan undangan Discord dan secara opsional memblokir semua URL.
 */

import { AutoModDefaults } from '../../../config/constants.js';

/** Pola regex untuk URL undangan Discord */
const INVITE_PATTERNS = [
  /discord\.gg\/\w+/i,
  /discordapp\.com\/invite\/\w+/i,
  /discord\.com\/invite\/\w+/i,
];

/** Pola deteksi URL umum */
const URL_PATTERN = /https?:\/\/[^\s<]+/gi;

export default class LinkFilter {
  /**
   * Periksa sebuah pesan untuk tautan yang diblokir.
   *
   * @param {import('discord.js').Message} message
   * @param {object} config - Pengaturan filter khusus per-server
   * @returns {{ triggered: boolean, reason: string }}
   */
  check(message, config = {}) {
    const content = message.content;
    const blockInvites = config.blockInvites ?? AutoModDefaults.LINK_BLOCK_INVITES;
    const blockAllUrls = config.blockAllUrls ?? false;

    // Periksa tautan undangan Discord
    if (blockInvites) {
      for (const pattern of INVITE_PATTERNS) {
        if (pattern.test(content)) {
          return {
            triggered: true,
            reason: 'Discord invite link detected',
          };
        }
      }
    }

    // Periksa semua URL
    if (blockAllUrls && URL_PATTERN.test(content)) {
      return {
        triggered: true,
        reason: 'URL detected (all links blocked)',
      };
    }

    return { triggered: false, reason: '' };
  }
}
