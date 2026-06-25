/**
 * LumigiaBOT — Konstanta Aplikasi
 * Nilai konfigurasi terpusat yang digunakan di seluruh bot.
 */

/** Warna embed untuk tema visual yang konsisten */
export const Colors = {
  PRIMARY: 0x7C3AED,    // Ungu - warna brand
  SUCCESS: 0x22C55E,    // Hijau - aksi berhasil
  WARNING: 0xF59E0B,    // Kuning - peringatan
  ERROR: 0xEF4444,      // Merah - error, ban
  INFO: 0x3B82F6,       // Biru - informasi
  MODERATION: 0xF97316, // Oranye - aksi moderasi
  TICKET: 0x06B6D4,     // Cyan - sistem tiket
  AUTOMOD: 0xA855F7,    // Ungu muda - automod
};

/** Nilai default pembatasan rate */
export const Cooldowns = {
  DEFAULT: 3000,         // Default 3 detik
  MODERATION: 5000,      // 5 detik untuk perintah moderasi
  ADMIN: 10000,          // 10 detik untuk perintah admin
};

/** Ambang batas auto-moderasi */
export const AutoModDefaults = {
  SPAM_MAX_MESSAGES: 5,       // Maks pesan dalam jangka waktu
  SPAM_TIMEFRAME: 5000,       // 5 detik
  SPAM_MAX_DUPLICATES: 3,     // Maks pesan duplikat
  CAPS_THRESHOLD: 0.7,        // Rasio huruf kapital 70%
  CAPS_MIN_LENGTH: 10,        // Minimal karakter untuk diperiksa
  EMOJI_MAX: 5,               // Maks emoji per pesan
  MENTION_MAX: 5,             // Maks mention per pesan
  LINK_BLOCK_INVITES: true,   // Blokir undangan Discord secara default
};

/** Nilai default sistem tiket */
export const TicketDefaults = {
  MAX_OPEN: 1,
  AUTO_CLOSE_HOURS: 48,
  DELETE_DELAY_MS: 5000,      // 5 detik sebelum channel dihapus
  CATEGORIES: ['general', 'support', 'bug-report', 'partnership'],
};

/** Nilai default anti-raid */
export const AntiRaidDefaults = {
  THRESHOLD: 10,              // Jumlah join per jangka waktu
  TIMEFRAME: 30000,           // 30 detik
  MIN_ACCOUNT_AGE: 7,         // Hari
};

/** Nilai default eskalasi peringatan */
export const EscalationDefaults = {
  3: 'mute',
  5: 'kick',
  7: 'ban',
};

/** Batasan bot */
export const Limits = {
  PURGE_MAX: 100,
  PURGE_MIN: 1,
  SLOWMODE_MAX: 21600,        // 6 jam dalam detik
  WARN_REASON_MAX: 512,
  TICKET_REASON_MAX: 1024,
};
