/**
 * LumigiaBOT — Aksi Bisukan
 * Menghapus pesan yang memicu filter dan membisukan pengguna.
 */

import { parseDuration } from '../../../utils/TimeFormatter.js';
import { logger } from '../../../utils/Logger.js';

/** Durasi bisukan default: 5 menit */
const DEFAULT_MUTE_DURATION = 5 * 60 * 1000;

export default class MuteAction {
  /**
   * Menghapus pesan dan membisukan pengguna.
   *
   * @param {import('discord.js').Message} message
   * @param {import('../../../core/BotClient.js').default} client
   * @param {object} config
   * @param {string} [config.muteDuration] - String durasi (contoh: '5m', '1h')
   * @param {string} [config.reason] - Alasan pelanggaran filter
   */
  async execute(message, client, config) {
    try {
      // Hapus pesan
      if (message.deletable) {
        await message.delete();
      }

      // Parsing durasi dari konfigurasi atau gunakan default
      let durationMs = DEFAULT_MUTE_DURATION;
      if (config.muteDuration) {
        const parsed = parseDuration(config.muteDuration);
        if (parsed) durationMs = parsed;
      }

      const reason = config.reason || 'AutoMod violation';

      // Bisukan anggota
      const member = message.member ?? await message.guild.members.fetch(message.author.id);
      if (member.moderatable) {
        await member.timeout(durationMs, `[AutoMod] ${reason}`);
      }

      // Catat di log audit
      client.db.auditLogs.add(
        message.guild.id, 'AUTOMOD_MUTE', client.user.id, message.author.id,
        `[AutoMod] ${reason}`, { duration: durationMs },
      );
    } catch (error) {
      logger.error('AutoMod MuteAction failed:', error);
    }
  }
}
