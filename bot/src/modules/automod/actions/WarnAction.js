/**
 * LumigiaBOT — Aksi Peringatan
 * Menghapus pesan yang memicu filter dan memberikan peringatan otomatis.
 */

import { logger } from '../../../utils/Logger.js';

export default class WarnAction {
  /**
   * Menghapus pesan dan menambahkan peringatan kepada pengguna.
   *
   * @param {import('discord.js').Message} message
   * @param {import('../../../core/BotClient.js').default} client
   * @param {object} config
   * @param {string} config.reason - Alasan pelanggaran filter
   */
  async execute(message, client, config) {
    try {
      // Hapus pesan
      if (message.deletable) {
        await message.delete();
      }

      // Tambahkan peringatan otomatis
      const reason = config.reason || 'AutoMod violation';
      client.db.warnings.add(
        message.guild.id,
        message.author.id,
        client.user.id,
        `[AutoMod] ${reason}`,
      );

      // Catat di log audit
      client.db.auditLogs.add(
        message.guild.id, 'AUTOMOD_WARN', client.user.id, message.author.id,
        `[AutoMod] ${reason}`,
      );
    } catch (error) {
      logger.error('AutoMod WarnAction failed:', error);
    }
  }
}
