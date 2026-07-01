/**
 * LumigiaBOT — Layanan Jadwal Streaming
 * Utilitas statis untuk membangun embed jadwal, parsing hari,
 * dan validasi waktu.
 */

import { EmbedBuilder } from 'discord.js';
import { SCHEDULE_DAY_NAMES, SCHEDULE_DAY_ORDER } from '../../../../shared/contracts.js';

/** Warna embed jadwal (#9B59B6) */
const SCHEDULE_COLOR = 0x9B59B6;

/** Nama hari dalam Bahasa Indonesia, diindeks 0=Minggu */
/**
 * Peta nama hari (lowercase) → nomor hari.
 * Mendukung nama hari dalam Bahasa Indonesia maupun Inggris.
 * @type {Map<string, number>}
 */
const DAY_MAP = new Map([
  // Bahasa Indonesia
  ['minggu', 0],
  ['senin', 1],
  ['selasa', 2],
  ['rabu', 3],
  ['kamis', 4],
  ['jumat', 5],
  ['sabtu', 6],
  // English
  ['sunday', 0],
  ['monday', 1],
  ['tuesday', 2],
  ['wednesday', 3],
  ['thursday', 4],
  ['friday', 5],
  ['saturday', 6],
]);

/** Regex untuk validasi format waktu HH:MM (00:00 – 23:59) */
const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export default class ScheduleService {
  /**
   * Membangun rich embed yang menampilkan jadwal streaming mingguan.
   * Jadwal dikelompokkan berdasarkan hari (Senin–Minggu).
   * Setiap slot menampilkan waktu dan judul.
   *
   * @param {object[]} schedules - Array objek jadwal dari ScheduleRepo
   * @param {string} guildName - Nama server/guild
   * @returns {EmbedBuilder} Embed jadwal yang sudah diformat
   */
  static buildScheduleEmbed(schedules, guildName) {
    const embed = new EmbedBuilder()
      .setColor(SCHEDULE_COLOR)
      .setTitle(`📅 Jadwal Streaming — ${guildName}`)
      .setTimestamp()
      .setFooter({ text: 'LumigiaBOT' });

    if (!schedules || schedules.length === 0) {
      embed.setDescription('Belum ada jadwal');
      return embed;
    }

    // Kelompokkan jadwal berdasarkan hari (urutan Senin=1 ... Sabtu=6, Minggu=0)
    /** @type {Map<number, object[]>} */
    const grouped = new Map();

    for (const entry of schedules) {
      if (!grouped.has(entry.day_of_week)) {
        grouped.set(entry.day_of_week, []);
      }
      grouped.get(entry.day_of_week).push(entry);
    }

    // Bangun field untuk setiap hari yang memiliki jadwal
    for (const day of SCHEDULE_DAY_ORDER) {
      const entries = grouped.get(day);
      if (!entries || entries.length === 0) continue;

      const dayName = ScheduleService.formatDay(day);
      const lines = entries.map((e) => {
        const desc = e.description ? ` — *${e.description}*` : '';
        return `\`${e.time}\` ${e.title}${desc}`;
      });

      embed.addFields({
        name: `📌 ${dayName}`,
        value: lines.join('\n'),
      });
    }

    return embed;
  }

  /**
   * Mengonversi nomor hari ke nama hari dalam Bahasa Indonesia.
   * 0 = Minggu, 1 = Senin, ..., 6 = Sabtu.
   *
   * @param {number} dayNumber - Nomor hari (0–6)
   * @returns {string} Nama hari dalam Bahasa Indonesia
   */
  static formatDay(dayNumber) {
    return SCHEDULE_DAY_NAMES[dayNumber] ?? 'Unknown';
  }

  /**
   * Parse string nama hari menjadi nomor hari.
   * Mendukung Bahasa Indonesia (senin, selasa, ...) dan
   * Bahasa Inggris (monday, tuesday, ...). Case-insensitive.
   *
   * @param {string} dayString - Nama hari (contoh: 'monday', 'senin')
   * @returns {number|null} Nomor hari (0–6) atau null jika tidak valid
   */
  static parseDay(dayString) {
    if (!dayString) return null;
    const result = DAY_MAP.get(dayString.toLowerCase());
    return result !== undefined ? result : null;
  }

  /**
   * Memvalidasi format waktu HH:MM (00:00 – 23:59).
   *
   * @param {string} timeStr - String waktu untuk divalidasi
   * @returns {boolean} True jika format valid
   */
  static validateTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return false;
    return TIME_REGEX.test(timeStr);
  }
}
