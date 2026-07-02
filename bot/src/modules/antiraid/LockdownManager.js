/**
 * LumigiaBOT — Manajer Lockdown
 * Menangani lockdown channel seluruh server dengan mengubah izin @everyone.
 * Digunakan oleh mesin AntiRaid dan perintah lockdown manual.
 */

import { ChannelType } from 'discord.js';
import { createServiceLogger } from '../../utils/Logger.js';

const log = createServiceLogger('lockdown-manager');

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
        log.error('channel_lock_failed', {
          guildId: guild.id,
          channelId: channel.id,
          reason,
        }, error);
      }
    }

    log.info('lock_completed', {
      guildId: guild.id,
      locked,
      total: textChannels.size,
      reason,
    });
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
        log.error('channel_unlock_failed', {
          guildId: guild.id,
          channelId: channel.id,
          reason,
        }, error);
      }
    }

    log.info('unlock_completed', {
      guildId: guild.id,
      unlocked,
      total: textChannels.size,
      reason,
    });
    return unlocked;
  }
}
