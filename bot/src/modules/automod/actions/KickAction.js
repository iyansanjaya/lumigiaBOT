/**
 * LumigiaBOT — Aksi Tendang
 * Menghapus pesan yang memicu filter dan menendang pengguna dari guild.
 */

import { logger } from '../../../utils/Logger.js';

export default class KickAction {
  /**
   * Menghapus pesan dan menendang anggota.
   *
   * @param {import('discord.js').Message} message
   * @param {import('../../../core/BotClient.js').default} client
   * @param {object} config
   * @param {string} [config.reason] - Alasan pelanggaran filter
   */
  async execute(message, client, config) {
    try {
      // Hapus pesan
      if (message.deletable) {
        await message.delete();
      }

      const reason = config.reason || 'AutoMod violation';

      // Tendang anggota
      const member = message.member ?? await message.guild.members.fetch(message.author.id);
      if (member.kickable) {
        await member.kick(`[AutoMod] ${reason}`);
      }

      // Catat di log audit
      client.db.auditLogs.add(
        message.guild.id, 'AUTOMOD_KICK', client.user.id, message.author.id,
        `[AutoMod] ${reason}`,
      );
    } catch (error) {
      logger.error('AutoMod KickAction failed:', error);
    }
  }
}
