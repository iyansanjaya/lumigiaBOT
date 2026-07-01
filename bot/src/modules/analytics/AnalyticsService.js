/**
 * LumigiaBOT — Layanan Analytics
 * Melacak aktivitas server: pesan, anggota masuk/keluar.
 * Menggunakan AnalyticsRepo untuk menyimpan data harian.
 */

import { createServiceLogger } from '../../utils/Logger.js';

const log = createServiceLogger('analytics-service');

export default class AnalyticsService {
  /**
   * Membuat instance AnalyticsService.
   * @param {import('../../core/BotClient.js').default} client
   */
  constructor(client) {
    /** @type {import('../../core/BotClient.js').default} */
    this.client = client;

    log.info('initialized');
  }

  /**
   * Track pesan masuk — increment daily_stats.messages dan channel_activity.
   * Mengabaikan bot dan DM.
   * @param {import('discord.js').Message} message
   */
  trackMessage(message) {
    try {
      // Abaikan bot, DM, dan pesan sistem
      if (message.author.bot || !message.guild || message.system) return;

      const guildId = message.guild.id;
      const channelId = message.channel.id;

      this.client.db.analytics.trackMessage(guildId);
      this.client.db.analytics.trackChannelMessage(guildId, channelId);
    } catch (error) {
      log.error('track_message_failed', {
        guildId: message.guild?.id,
        channelId: message.channel?.id,
        messageId: message.id,
      }, error);
    }
  }

  /**
   * Track anggota baru bergabung — increment members_joined.
   * @param {import('discord.js').GuildMember} member
   */
  trackMemberJoin(member) {
    try {
      this.client.db.analytics.trackMemberJoin(member.guild.id);
    } catch (error) {
      log.error('track_member_join_failed', { guildId: member.guild?.id, userId: member.id }, error);
    }
  }

  /**
   * Track anggota keluar — increment members_left.
   * @param {import('discord.js').GuildMember} member
   */
  trackMemberLeave(member) {
    try {
      this.client.db.analytics.trackMemberLeave(member.guild.id);
    } catch (error) {
      log.error('track_member_leave_failed', { guildId: member.guild?.id, userId: member.id }, error);
    }
  }
}
