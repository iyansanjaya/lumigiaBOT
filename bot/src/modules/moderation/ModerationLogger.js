/**
 * LumigiaBOT — Logger Moderasi
 * Mengirim embed tindakan moderasi yang diformat ke kanal log moderasi server.
 */

import { modEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';

export default class ModerationLogger {
  /**
   * Mengirim embed tindakan moderasi ke mod_log_channel server.
   *
   * @param {import('../../core/BotClient.js').default} client
   * @param {import('discord.js').Guild} guild
   * @param {object} options
   * @param {string} options.action - Nama tampilan (contoh: "Ban", "Kick")
   * @param {import('discord.js').GuildMember} options.target
   * @param {import('discord.js').GuildMember} options.moderator
   * @param {string} options.reason
   * @param {string} [options.duration]
   */
  static async log(client, guild, { action, target, moderator, reason, duration }) {
    try {
      const settings = client.db.guildSettings.get(guild.id);
      if (!settings?.mod_log_channel) return;

      const channel = await guild.channels.fetch(settings.mod_log_channel).catch(() => null);
      if (!channel) return;

      const embed = modEmbed({
        action,
        target: target.user ?? target,
        moderator: moderator.user ?? moderator,
        reason,
        duration,
      });

      await channel.send({ embeds: [embed] });
    } catch (error) {
      logger.error(`Failed to log moderation action to channel:`, error);
    }
  }
}
