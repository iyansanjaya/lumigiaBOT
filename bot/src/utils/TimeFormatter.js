/**
 * LumigiaBOT — Pemformat Waktu
 * Mengurai durasi yang mudah dibaca manusia dan memformat timestamp.
 */

import ms from 'ms';

/**
 * Mengurai string durasi yang mudah dibaca menjadi milidetik.
 * Mendukung: 30s, 5m, 1h, 7d, 2w, dll.
 *
 * @param {string} input - contoh: "30m", "1h", "7d"
 * @returns {number|null} Milidetik, atau null jika tidak valid
 */
export function parseDuration(input) {
  if (!input || typeof input !== 'string') return null;

  const result = ms(input.trim());

  if (!result || result <= 0) return null;

  return result;
}

/**
 * Memformat milidetik menjadi string yang mudah dibaca.
 * @param {number} milliseconds
 * @returns {string} contoh: "2 hours", "7 days"
 */
export function formatDuration(milliseconds) {
  if (!milliseconds || milliseconds <= 0) return 'Permanent';
  return ms(milliseconds, { long: true });
}

/**
 * Parse timestamp dari SQLite datetime('now') atau ISO string.
 * @param {string|null|undefined} value
 * @returns {number|null} Unix timestamp dalam ms, atau null jika tidak valid
 */
export function parseStoredTimestamp(value) {
  if (!value || typeof value !== 'string') return null;

  const trimmed = value.trim();
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(trimmed);
  const normalizedBody = trimmed.includes('T') ? trimmed : trimmed.replace(' ', 'T');
  const normalized = hasTimezone ? normalizedBody : `${normalizedBody}Z`;
  const timestamp = Date.parse(normalized);

  return Number.isNaN(timestamp) ? null : timestamp;
}

/**
 * Membuat timestamp relatif Discord.
 * @param {Date|number} date
 * @param {'t'|'T'|'d'|'D'|'f'|'F'|'R'} [style='R'] - R = relatif ("2 hours ago")
 * @returns {string}
 */
export function discordTimestamp(date, style = 'R') {
  const seconds = Math.floor((date instanceof Date ? date.getTime() : date) / 1000);
  return `<t:${seconds}:${style}>`;
}

/**
 * Mendapatkan durasi timeout maksimum Discord (28 hari dalam ms).
 * @returns {number}
 */
export function maxTimeoutDuration() {
  return 28 * 24 * 60 * 60 * 1000; // 28 hari
}
