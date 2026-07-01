/**
 * LumigiaBOT — Helper i18n
 * Fungsi terjemahan per-guild yang menghormati pengaturan bahasa setiap server.
 */

import i18next from './index.js';
import { normalizeLanguage } from '../../../shared/contracts.js';

/**
 * Mendapatkan terjemahan untuk guild tertentu.
 * Mencari pengaturan bahasa guild dari database,
 * menggunakan bahasa default jika tidak diatur.
 *
 * @param {import('../core/BotClient.js').default} client
 * @param {string} guildId
 * @param {string} key - Kunci terjemahan (contoh: 'commands.ban.success')
 * @param {object} [options] - Variabel interpolasi
 * @returns {string}
 */
export function t(client, guildId, key, options = {}) {
  let language = 'en-US';

  // Ambil bahasa guild dari database jika tersedia
  if (client.db && guildId) {
    try {
      const settings = client.db.guildSettings.get(guildId);
      if (settings?.language) {
        language = normalizeLanguage(settings.language);
      }
    } catch {
      // Gunakan default jika pembacaan DB gagal
    }
  }

  return i18next.t(key, { lng: language, ...options });
}

/**
 * Mendapatkan terjemahan menggunakan bahasa tertentu (melewati pencarian guild).
 *
 * @param {string} language - Kode locale ('en-US' atau 'id')
 * @param {string} key - Kunci terjemahan
 * @param {object} [options] - Variabel interpolasi
 * @returns {string}
 */
export function tLang(language, key, options = {}) {
  return i18next.t(key, { lng: normalizeLanguage(language), ...options });
}
