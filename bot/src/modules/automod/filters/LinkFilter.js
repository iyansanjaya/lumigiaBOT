/**
 * LumigiaBOT — Filter Tautan
 * Mendeteksi tautan undangan Discord, URL HTTP tidak aman, phishing, dan memblokir semua URL.
 */

import { AutoModDefaults } from '../../../config/constants.js';
import PhishingService from '../PhishingService.js';

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
    const blockInvites = config.blockInvites ?? AutoModDefaults.LINK_BLOCK_INVITES; // Default true
    const blockPhishing = config.blockPhishing ?? true; // Default true untuk fitur baru
    const blockHttp = config.blockHttp ?? false;
    const blockAllUrls = config.blockAllUrls ?? false;

    // Kumpulkan semua URL yang ditemukan di pesan
    const urls = content.match(URL_PATTERN) || [];

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

    // Periksa setiap URL individual
    for (const url of urls) {
      // 1. Phishing Check
      if (blockPhishing && PhishingService.isPhishing(url)) {
        return {
          triggered: true,
          reason: 'Phishing/malicious link detected',
        };
      }

      // 2. HTTP Check (Insecure)
      if (blockHttp && url.toLowerCase().startsWith('http://')) {
        return {
          triggered: true,
          reason: 'Insecure HTTP link blocked',
        };
      }
    }

    // Periksa semua URL (Global block)
    if (blockAllUrls && urls.length > 0) {
      return {
        triggered: true,
        reason: 'URL detected (all links blocked)',
      };
    }

    return { triggered: false, reason: '' };
  }
}
