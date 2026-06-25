/**
 * LumigiaBOT — Aksi Hapus
 * Menghapus pesan yang memicu filter automod.
 */

import { logger } from '../../../utils/Logger.js';

export default class DeleteAction {
  /**
   * Menghapus pesan yang memicu filter.
   *
   * @param {import('discord.js').Message} message
   * @param {import('../../../core/BotClient.js').default} client
   * @param {object} config
   */
  async execute(message, client, config) {
    try {
      if (message.deletable) {
        await message.delete();
      }
    } catch (error) {
      logger.error('AutoMod DeleteAction failed:', error);
    }
  }
}
