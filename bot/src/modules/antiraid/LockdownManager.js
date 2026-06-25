/**
 * LumigiaBOT — Manajer Lockdown
 * Menangani lockdown channel seluruh server dengan mengubah izin @everyone.
 * Digunakan oleh mesin AntiRaid dan perintah lockdown manual.
 */

import { ChannelType } from 'discord.js';
import { logger } from '../../utils/Logger.js';

export default class LockdownManager {
  /**
   * Mengunci semua channel teks dengan menolak izin SendMessages untuk @everyone.
   *
   * @param {import('discord.js').Guild} guild
   * @param {string} [reason='Emergency lockdown']
   * @returns {Promise<number>} Jumlah channel yang dikunci
   */
  static async lockAll(guild, reason = 'Emergency lockdown') {
    let locked = 0;
    const everyone = guild.roles.everyone;

    const textChannels = guild.channels.cache.filter(
      (ch) => ch.type === ChannelType.GuildText || ch.type === ChannelType.GuildAnnouncement,
    );

    for (const [, channel] of textChannels) {
      try {
        await channel.permissionOverwrites.edit(everyone, {
          SendMessages: false,
        }, { reason });
        locked++;
      } catch (error) {
        logger.error(`Failed to lock channel ${channel.name}:`, error);
      }
    }

    logger.info(`Locked ${locked}/${textChannels.size} channels in ${guild.name}`);
    return locked;
  }

  /**
   * Membuka kunci semua channel teks dengan mengatur ulang SendMessages @everyone ke inherit.
   *
   * @param {import('discord.js').Guild} guild
   * @param {string} [reason='Lockdown lifted']
   * @returns {Promise<number>} Jumlah channel yang dibuka kuncinya
   */
  static async unlockAll(guild, reason = 'Lockdown lifted') {
    let unlocked = 0;
    const everyone = guild.roles.everyone;

    const textChannels = guild.channels.cache.filter(
      (ch) => ch.type === ChannelType.GuildText || ch.type === ChannelType.GuildAnnouncement,
    );

    for (const [, channel] of textChannels) {
      try {
        await channel.permissionOverwrites.edit(everyone, {
          SendMessages: null,
        }, { reason });
        unlocked++;
      } catch (error) {
        logger.error(`Failed to unlock channel ${channel.name}:`, error);
      }
    }

    logger.info(`Unlocked ${unlocked}/${textChannels.size} channels in ${guild.name}`);
    return unlocked;
  }
}
