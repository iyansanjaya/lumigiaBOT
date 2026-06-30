/**
 * LumigiaBOT - AutoMod ban action.
 * Deletes the triggering message and bans the member when the bot has permission.
 */

import { logger } from '../../../utils/Logger.js';

export default class BanAction {
  /**
   * @param {import('discord.js').Message} message
   * @param {import('../../../core/BotClient.js').default} client
   * @param {object} config
   * @param {string} [config.reason]
   */
  async execute(message, client, config) {
    try {
      if (message.deletable) {
        await message.delete();
      }

      const reason = config.reason || 'AutoMod violation';
      const member = message.member ?? await message.guild.members.fetch(message.author.id);

      if (member.bannable) {
        await member.ban({ reason: `[AutoMod] ${reason}` });
      }

      client.db.auditLogs.add(
        message.guild.id, 'AUTOMOD_BAN', client.user.id, message.author.id,
        `[AutoMod] ${reason}`,
      );
    } catch (error) {
      logger.error('AutoMod BanAction failed:', error);
    }
  }
}
