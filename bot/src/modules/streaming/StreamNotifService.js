/**
 * LumigiaBOT — Layanan Notifikasi Stream
 * Polling berkala untuk Twitch dan YouTube, mengirim notifikasi live ke channel Discord.
 * Mengelola status live, embed notifikasi, dan update stream ended.
 */

import { EmbedBuilder } from 'discord.js';
import TwitchAPI from './TwitchAPI.js';
import YouTubeChecker from './YouTubeChecker.js';
import { createServiceLogger } from '../../utils/Logger.js';

/** Warna embed per platform */
const COLORS = {
  TWITCH: 0x9146FF,
  YOUTUBE: 0xFF0000,
  SUCCESS: 0x43B581,
  ERROR: 0xF04747,
};

/** Interval polling (ms) */
const TWITCH_INTERVAL = 60_000;   // 60 detik
const YOUTUBE_INTERVAL = 120_000; // 120 detik
const log = createServiceLogger('stream-notifications');

export default class StreamNotifService {
  /**
   * @param {import('../../core/BotClient.js').default} client
   */
  constructor(client) {
    /** @type {import('../../core/BotClient.js').default} */
    this.client = client;

    /** @type {NodeJS.Timeout|null} */
    this.twitchInterval = null;

    /** @type {NodeJS.Timeout|null} */
    this.youtubeInterval = null;

    /** @type {Map<string, string>} Cache message ID per notif ID untuk edit saat ended */
    this.sentMessages = new Map();
  }

  /**
   * Memulai polling untuk kedua platform.
   */
  start() {
    log.info('starting');

    // Cek Twitch (hanya jika dikonfigurasi)
    if (TwitchAPI.isConfigured()) {
      // Delay awal 10 detik agar bot ready
      setTimeout(() => this.checkTwitch(), 10_000);
      this.twitchInterval = setInterval(() => this.checkTwitch(), TWITCH_INTERVAL);
      log.info('polling_started', { platform: 'twitch', intervalMs: TWITCH_INTERVAL });
    } else {
      log.warn('polling_skipped', { platform: 'twitch', reason: 'not_configured' });
    }

    // YouTube selalu bisa dicek (tanpa API key)
    setTimeout(() => this.checkYouTube(), 15_000);
    this.youtubeInterval = setInterval(() => this.checkYouTube(), YOUTUBE_INTERVAL);
    log.info('polling_started', { platform: 'youtube', intervalMs: YOUTUBE_INTERVAL });
  }

  /**
   * Menghentikan semua interval polling.
   */
  stop() {
    if (this.twitchInterval) {
      clearInterval(this.twitchInterval);
      this.twitchInterval = null;
    }
    if (this.youtubeInterval) {
      clearInterval(this.youtubeInterval);
      this.youtubeInterval = null;
    }
    log.info('stopped');
  }

  /**
   * Mengecek semua streamer Twitch yang terdaftar.
   * Mengelompokkan berdasarkan username untuk menghindari API call duplikat.
   */
  async checkTwitch() {
    try {
      const notifs = this.client.db.streamNotif.getByPlatform('twitch');
      if (notifs.length === 0) return;

      // Kelompokkan berdasarkan username
      /** @type {Map<string, object[]>} */
      const grouped = new Map();
      for (const notif of notifs) {
        const user = notif.platform_user.toLowerCase();
        if (!grouped.has(user)) grouped.set(user, []);
        grouped.get(user).push(notif);
      }

      // Cek setiap username sekali
      for (const [username, configs] of grouped) {
        try {
          const stream = await TwitchAPI.getStream(username);

          if (stream) {
            // Streamer sedang live
            const streamId = stream.id;
            for (const config of configs) {
              if (!config.is_live || config.last_stream_id !== streamId) {
                // Transisi offline → live, atau stream baru
                await this.sendNotification(config, {
                  platform: 'twitch',
                  username: stream.user_name,
                  title: stream.title,
                  game: stream.game_name,
                  viewers: stream.viewer_count,
                  thumbnail: stream.thumbnail_url
                    .replace('{width}', '1280')
                    .replace('{height}', '720'),
                  url: `https://www.twitch.tv/${username}`,
                  profileImage: null, // Diambil lazy jika perlu
                  startedAt: stream.started_at,
                });
                this.client.db.streamNotif.setLiveStatus(config.id, true, streamId);
              }
            }
          } else {
            // Streamer offline
            for (const config of configs) {
              if (config.is_live) {
                await this.updateEndedNotification(config);
                this.client.db.streamNotif.setLiveStatus(config.id, false, null);
              }
            }
          }
        } catch (error) {
          log.error('stream_check_failed', {
            platform: 'twitch',
            platformUser: username,
            configs: configs.length,
          }, error);
        }
      }
    } catch (error) {
      log.error('poll_failed', { platform: 'twitch' }, error);
    }
  }

  /**
   * Mengecek semua channel YouTube yang terdaftar.
   */
  async checkYouTube() {
    try {
      const notifs = this.client.db.streamNotif.getByPlatform('youtube');
      if (notifs.length === 0) return;

      // Kelompokkan berdasarkan channel ID
      /** @type {Map<string, object[]>} */
      const grouped = new Map();
      for (const notif of notifs) {
        const channelId = notif.platform_user;
        if (!grouped.has(channelId)) grouped.set(channelId, []);
        grouped.get(channelId).push(notif);
      }

      for (const [channelId, configs] of grouped) {
        try {
          const result = await YouTubeChecker.checkLive(channelId);

          if (result && result.isLive) {
            const videoId = result.videoId;
            for (const config of configs) {
              if (!config.is_live || config.last_stream_id !== videoId) {
                await this.sendNotification(config, {
                  platform: 'youtube',
                  username: channelId,
                  title: result.title,
                  game: null,
                  viewers: null,
                  thumbnail: result.thumbnail,
                  url: `https://www.youtube.com/watch?v=${videoId}`,
                  profileImage: null,
                  startedAt: null,
                });
                this.client.db.streamNotif.setLiveStatus(config.id, true, videoId);
              }
            }
          } else {
            for (const config of configs) {
              if (config.is_live) {
                await this.updateEndedNotification(config);
                this.client.db.streamNotif.setLiveStatus(config.id, false, null);
              }
            }
          }
        } catch (error) {
          log.error('stream_check_failed', {
            platform: 'youtube',
            platformUser: channelId,
            configs: configs.length,
          }, error);
        }
      }
    } catch (error) {
      log.error('poll_failed', { platform: 'youtube' }, error);
    }
  }

  /**
   * Mengirim notifikasi live stream ke channel Discord yang dikonfigurasi.
   * @param {object} config - Konfigurasi notifikasi dari database
   * @param {object} streamData - Data stream
   * @param {string} streamData.platform - 'twitch' atau 'youtube'
   * @param {string} streamData.username - Username/channel streamer
   * @param {string} streamData.title - Judul stream
   * @param {string|null} streamData.game - Game/kategori (Twitch only)
   * @param {number|null} streamData.viewers - Jumlah penonton (Twitch only)
   * @param {string} streamData.thumbnail - URL thumbnail stream
   * @param {string} streamData.url - URL stream
   * @param {string|null} streamData.profileImage - URL foto profil
   * @param {string|null} streamData.startedAt - Waktu mulai stream (ISO)
   */
  async sendNotification(config, streamData) {
    try {
      const channel = await this.client.channels.fetch(config.notify_channel);
      if (!channel || !channel.isTextBased()) {
        log.warn('notify_channel_unavailable', {
          guildId: config.guild_id,
          configId: config.id,
          channelId: config.notify_channel,
          platform: config.platform,
          platformUser: config.platform_user,
        });
        return;
      }

      const isTwitch = streamData.platform === 'twitch';
      const platformEmoji = isTwitch ? '<:twitch:>' : '▶️';
      const platformName = isTwitch ? 'Twitch' : 'YouTube';
      const color = isTwitch ? COLORS.TWITCH : COLORS.YOUTUBE;

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`🔴 ${streamData.title || 'Live Stream'}`)
        .setURL(streamData.url)
        .setDescription(
          `**${streamData.username}** sedang live di ${platformName}!\n\n` +
          `[▶️ Tonton Sekarang](${streamData.url})`,
        )
        .setTimestamp()
        .setFooter({ text: `LumigiaBOT • ${platformName} Live` });

      // Tambah thumbnail
      if (streamData.thumbnail) {
        embed.setImage(streamData.thumbnail);
      }

      // Tambah profil image jika ada
      if (streamData.profileImage) {
        embed.setThumbnail(streamData.profileImage);
      }

      // Fields
      const fields = [];
      if (streamData.game) {
        fields.push({ name: '🎮 Game/Kategori', value: streamData.game, inline: true });
      }
      if (streamData.viewers !== null && streamData.viewers !== undefined) {
        fields.push({ name: '👥 Penonton', value: streamData.viewers.toLocaleString(), inline: true });
      }
      fields.push({ name: '📺 Platform', value: platformName, inline: true });

      if (streamData.startedAt) {
        const startTime = Math.floor(new Date(streamData.startedAt).getTime() / 1000);
        fields.push({ name: '⏰ Mulai', value: `<t:${startTime}:R>`, inline: true });
      }

      if (fields.length > 0) {
        embed.addFields(fields);
      }

      // Bangun konten pesan (ping role + custom message)
      let messageContent = '';
      if (config.ping_role) {
        messageContent += `<@&${config.ping_role}> `;
      }
      if (config.custom_message) {
        messageContent += config.custom_message;
      }

      const sentMsg = await channel.send({
        content: messageContent.trim() || undefined,
        embeds: [embed],
      });

      // Simpan message ID untuk nanti bisa di-edit saat stream ended
      this.sentMessages.set(`${config.id}`, sentMsg.id);

      log.info('notification_sent', {
        guildId: config.guild_id,
        configId: config.id,
        channelId: config.notify_channel,
        platform: streamData.platform,
        platformUser: streamData.username,
        streamTitle: streamData.title,
        messageId: sentMsg.id,
      });
    } catch (error) {
      log.error('notification_send_failed', {
        guildId: config.guild_id,
        configId: config.id,
        channelId: config.notify_channel,
        platform: config.platform,
        platformUser: config.platform_user,
      }, error);
    }
  }

  /**
   * Meng-edit embed notifikasi asli untuk menunjukkan stream telah berakhir.
   * @param {object} config - Konfigurasi notifikasi dari database
   */
  async updateEndedNotification(config) {
    try {
      const messageId = this.sentMessages.get(`${config.id}`);
      if (!messageId) return; // Tidak ada pesan untuk di-edit

      const channel = await this.client.channels.fetch(config.notify_channel);
      if (!channel || !channel.isTextBased()) {
        log.warn('ended_update_channel_unavailable', {
          guildId: config.guild_id,
          configId: config.id,
          channelId: config.notify_channel,
          platform: config.platform,
          platformUser: config.platform_user,
        });
        return;
      }

      const message = await channel.messages.fetch(messageId).catch(() => null);
      if (!message) {
        this.sentMessages.delete(`${config.id}`);
        log.warn('ended_update_message_missing', {
          guildId: config.guild_id,
          configId: config.id,
          channelId: config.notify_channel,
          platform: config.platform,
          platformUser: config.platform_user,
          messageId,
        });
        return;
      }

      const isTwitch = config.platform === 'twitch';
      const platformName = isTwitch ? 'Twitch' : 'YouTube';
      const color = 0x808080; // Abu-abu untuk stream ended

      const existingEmbed = message.embeds[0];
      const endedEmbed = new EmbedBuilder()
        .setColor(color)
        .setTitle(`⬛ Stream Berakhir — ${config.platform_user}`)
        .setDescription(
          `Stream **${config.platform_user}** di ${platformName} telah berakhir.\n` +
          (existingEmbed?.url ? `[Lihat VOD/Replay](${existingEmbed.url})` : ''),
        )
        .setTimestamp()
        .setFooter({ text: `LumigiaBOT • ${platformName} Stream Ended` });

      await message.edit({ embeds: [endedEmbed] });
      this.sentMessages.delete(`${config.id}`);

      log.info('ended_notification_updated', {
        guildId: config.guild_id,
        configId: config.id,
        channelId: config.notify_channel,
        platform: config.platform,
        platformUser: config.platform_user,
        messageId,
      });
    } catch (error) {
      log.error('ended_notification_update_failed', {
        guildId: config.guild_id,
        configId: config.id,
        channelId: config.notify_channel,
        platform: config.platform,
        platformUser: config.platform_user,
      }, error);
    }
  }

  /**
   * Membangun embed preview untuk konfirmasi setup.
   * @param {'twitch'|'youtube'} platform
   * @param {string} username
   * @param {string} channelMention - Mention channel Discord
   * @param {string|null} roleMention - Mention role (optional)
   * @returns {EmbedBuilder}
   */
  static buildPreviewEmbed(platform, username, channelMention, roleMention) {
    const isTwitch = platform === 'twitch';
    const platformName = isTwitch ? 'Twitch' : 'YouTube';
    const color = isTwitch ? COLORS.TWITCH : COLORS.YOUTUBE;
    const url = isTwitch
      ? `https://www.twitch.tv/${username}`
      : `https://www.youtube.com/channel/${username}`;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`📺 ${platformName} Notification Setup`)
      .setDescription(
        `Notifikasi live stream telah dikonfigurasi!\n\n` +
        `**Streamer:** \`${username}\`\n` +
        `**Platform:** ${platformName}\n` +
        `**Channel:** ${channelMention}\n` +
        `**Ping Role:** ${roleMention || '*None*'}\n` +
        `**URL:** [${username}](${url})`,
      )
      .setTimestamp()
      .setFooter({ text: 'LumigiaBOT' });

    return embed;
  }

  /**
   * Membangun embed untuk test notification dengan data placeholder.
   * @param {'twitch'|'youtube'} platform
   * @param {string} username
   * @returns {EmbedBuilder}
   */
  static buildTestEmbed(platform, username) {
    const isTwitch = platform === 'twitch';
    const platformName = isTwitch ? 'Twitch' : 'YouTube';
    const color = isTwitch ? COLORS.TWITCH : COLORS.YOUTUBE;
    const url = isTwitch
      ? `https://www.twitch.tv/${username}`
      : `https://www.youtube.com/channel/${username}`;

    const embed = new EmbedBuilder()
      .setColor(color)
      .setTitle(`🔴 [TEST] ${username} sedang Live!`)
      .setURL(url)
      .setDescription(
        `**${username}** sedang live di ${platformName}!\n\n` +
        `[▶️ Tonton Sekarang](${url})\n\n` +
        `*Ini adalah notifikasi percobaan.*`,
      )
      .addFields(
        { name: '🎮 Game/Kategori', value: isTwitch ? 'Just Chatting' : 'Live Stream', inline: true },
        { name: '👥 Penonton', value: '123', inline: true },
        { name: '📺 Platform', value: platformName, inline: true },
      )
      .setTimestamp()
      .setFooter({ text: `LumigiaBOT • ${platformName} Live [TEST]` });

    return embed;
  }
}
