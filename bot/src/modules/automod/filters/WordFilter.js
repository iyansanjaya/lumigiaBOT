/**
 * LumigiaBOT — Filter Kata
 * Memeriksa konten pesan terhadap tabel word_filter server.
 * Mendukung pencocokan literal (tidak peka huruf besar/kecil) dan pola regex.
 */

export default class WordFilter {
  /**
   * Periksa sebuah pesan untuk kata/pola yang diblokir.
   *
   * @param {import('discord.js').Message} message
   * @param {object} config - Konfigurasi filter per-server
   * @param {import('../../../core/BotClient.js').default} client - Klien bot untuk akses database
   * @returns {{ triggered: boolean, reason: string }}
   */
  check(message, config, client) {
    const content = message.content;
    if (!content) return { triggered: false, reason: '' };

    // Ambil daftar kata server dari database
    let words;
    try {
      words = client.db.automod.getWords(message.guild.id);
    } catch {
      return { triggered: false, reason: '' };
    }

    if (!words || words.length === 0) {
      return { triggered: false, reason: '' };
    }

    for (const entry of words) {
      if (entry.is_regex) {
        // Pencocokan pola regex
        try {
          const regex = new RegExp(entry.word, 'i');
          if (regex.test(content)) {
            return {
              triggered: true,
              reason: `Matched regex pattern: ${entry.word}`,
            };
          }
        } catch {
          // Regex tidak valid — lewati secara diam-diam
          continue;
        }
      } else {
        // Pencocokan literal tidak peka huruf besar/kecil
        if (content.toLowerCase().includes(entry.word.toLowerCase())) {
          return {
            triggered: true,
            reason: `Blocked word detected`,
          };
        }
      }
    }

    return { triggered: false, reason: '' };
  }
}
