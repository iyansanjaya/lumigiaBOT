/**
 * LumigiaBOT — Perintah /stream
 * Mengelola notifikasi live streaming Twitch & YouTube.
 * Subperintah: setup, remove, list, test.
 * Membutuhkan izin ManageGuild.
 */

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
} from 'discord.js';
import { createEmbed, successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';
import TwitchAPI from '../../modules/streaming/TwitchAPI.js';
import StreamNotifService from '../../modules/streaming/StreamNotifService.js';

/** Warna embed per platform */
const COLORS = {
  TWITCH: 0x9146FF,
  YOUTUBE: 0xFF0000,
};

export const cooldown = 5000;

export const data = new SlashCommandBuilder()
  .setName('stream')
  .setDescription('Kelola notifikasi live streaming')
  // ── setup ──
  .addSubcommand((sub) =>
    sub
      .setName('setup')
      .setDescription('Tambah notifikasi live stream baru')
      .addStringOption((opt) =>
        opt
          .setName('platform')
          .setDescription('Platform streaming')
          .setRequired(true)
          .addChoices(
            { name: 'Twitch', value: 'twitch' },
            { name: 'YouTube', value: 'youtube' },
          ),
      )
      .addStringOption((opt) =>
        opt
          .setName('username')
          .setDescription('Username Twitch atau Channel ID YouTube (UCxxxx...)')
          .setRequired(true),
      )
      .addChannelOption((opt) =>
        opt
          .setName('channel')
          .setDescription('Channel untuk mengirim notifikasi')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true),
      )
      .addRoleOption((opt) =>
        opt
          .setName('role')
          .setDescription('Role yang akan di-ping saat live (opsional)')
          .setRequired(false),
      )
      .addStringOption((opt) =>
        opt
          .setName('message')
          .setDescription('Pesan kustom untuk notifikasi (opsional)')
          .setRequired(false),
      ),
  )
  // ── remove ──
  .addSubcommand((sub) =>
    sub
      .setName('remove')
      .setDescription('Hapus notifikasi live stream')
      .addStringOption((opt) =>
        opt
          .setName('platform')
          .setDescription('Platform streaming')
          .setRequired(true)
          .addChoices(
            { name: 'Twitch', value: 'twitch' },
            { name: 'YouTube', value: 'youtube' },
          ),
      )
      .addStringOption((opt) =>
        opt
          .setName('username')
          .setDescription('Username Twitch atau Channel ID YouTube')
          .setRequired(true),
      ),
  )
  // ── list ──
  .addSubcommand((sub) =>
    sub.setName('list').setDescription('Tampilkan semua notifikasi live stream server ini'),
  )
  // ── test ──
  .addSubcommand((sub) =>
    sub
      .setName('test')
      .setDescription('Kirim notifikasi percobaan')
      .addStringOption((opt) =>
        opt
          .setName('platform')
          .setDescription('Platform streaming')
          .setRequired(true)
          .addChoices(
            { name: 'Twitch', value: 'twitch' },
            { name: 'YouTube', value: 'youtube' },
          ),
      )
      .addStringOption((opt) =>
        opt
          .setName('username')
          .setDescription('Username Twitch atau Channel ID YouTube')
          .setRequired(true),
      ),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const subcommand = interaction.options.getSubcommand();

  try {
    switch (subcommand) {
      // ── Setup Notifikasi ──
      case 'setup': {
        const platform = interaction.options.getString('platform');
        const username = interaction.options.getString('username');
        const channel = interaction.options.getChannel('channel');
        const role = interaction.options.getRole('role');
        const customMessage = interaction.options.getString('message') ?? null;

        // Validasi Twitch: cek env vars dan verifikasi user ada
        if (platform === 'twitch') {
          if (!TwitchAPI.isConfigured()) {
            await interaction.reply({
              embeds: [errorEmbed(
                '❌ Twitch notifications are not enabled on this bot instance.',
              )],
              ephemeral: true,
            });
            return;
          }

          await interaction.deferReply({ ephemeral: true });

          // Verifikasi user Twitch ada
          const twitchUser = await TwitchAPI.getUser(username);
          if (!twitchUser) {
            await interaction.editReply({
              embeds: [errorEmbed(`❌ Twitch user **${username}** tidak ditemukan.`)],
            });
            return;
          }
        } else {
          await interaction.deferReply({ ephemeral: true });

          // Validasi format YouTube channel ID
          if (!username.startsWith('UC') || username.length < 20) {
            await interaction.editReply({
              embeds: [errorEmbed(
                '❌ YouTube Channel ID tidak valid.\n' +
                'Channel ID harus diawali dengan `UC` dan memiliki panjang minimal 24 karakter.\n' +
                'Contoh: `UCxxxxxxxxxxxxxxxxxxxxxx`',
              )],
            });
            return;
          }
        }

        // Simpan ke database
        client.db.streamNotif.add(
          interaction.guildId,
          platform,
          username,
          channel.id,
          role?.id ?? null,
          customMessage,
        );

        // Bangun embed preview
        const previewEmbed = StreamNotifService.buildPreviewEmbed(
          platform,
          username,
          `<#${channel.id}>`,
          role ? `<@&${role.id}>` : null,
        );

        await interaction.editReply({
          embeds: [
            successEmbed(`✅ Notifikasi live stream berhasil dikonfigurasi!`),
            previewEmbed,
          ],
        });
        break;
      }

      // ── Hapus Notifikasi ──
      case 'remove': {
        const platform = interaction.options.getString('platform');
        const username = interaction.options.getString('username');

        const removed = client.db.streamNotif.deleteByGuild(
          interaction.guildId,
          platform,
          username,
        );

        if (removed) {
          const platformName = platform === 'twitch' ? 'Twitch' : 'YouTube';
          await interaction.reply({
            embeds: [successEmbed(
              `✅ Notifikasi ${platformName} untuk **${username}** berhasil dihapus.`,
            )],
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            embeds: [errorEmbed(
              `❌ Tidak ditemukan notifikasi untuk **${username}** pada platform tersebut.`,
            )],
            ephemeral: true,
          });
        }
        break;
      }

      // ── Daftar Notifikasi ──
      case 'list': {
        const notifs = client.db.streamNotif.getByGuild(interaction.guildId);

        if (notifs.length === 0) {
          await interaction.reply({
            embeds: [createEmbed('info')
              .setTitle('📺 Stream Notifications')
              .setDescription('Belum ada notifikasi live stream yang dikonfigurasi.\nGunakan `/stream setup` untuk menambah.'),
            ],
            ephemeral: true,
          });
          return;
        }

        const twitchNotifs = notifs.filter((n) => n.platform === 'twitch');
        const youtubeNotifs = notifs.filter((n) => n.platform === 'youtube');

        const embed = createEmbed('info')
          .setTitle(`📺 Stream Notifications — ${interaction.guild.name}`)
          .setDescription(`Total: **${notifs.length}** notifikasi terkonfigurasi`);

        if (twitchNotifs.length > 0) {
          const lines = twitchNotifs.map((n) => {
            const status = n.is_live ? '🔴 LIVE' : '⚫ Offline';
            const role = n.ping_role ? ` • <@&${n.ping_role}>` : '';
            return `${status} **${n.platform_user}** → <#${n.notify_channel}>${role}`;
          });
          embed.addFields({
            name: '🟣 Twitch',
            value: lines.join('\n'),
          });
        }

        if (youtubeNotifs.length > 0) {
          const lines = youtubeNotifs.map((n) => {
            const status = n.is_live ? '🔴 LIVE' : '⚫ Offline';
            const role = n.ping_role ? ` • <@&${n.ping_role}>` : '';
            return `${status} **${n.platform_user}** → <#${n.notify_channel}>${role}`;
          });
          embed.addFields({
            name: '🔴 YouTube',
            value: lines.join('\n'),
          });
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
        break;
      }

      // ── Test Notifikasi ──
      case 'test': {
        const platform = interaction.options.getString('platform');
        const username = interaction.options.getString('username');

        // Cek Twitch dikonfigurasi
        if (platform === 'twitch' && !TwitchAPI.isConfigured()) {
          await interaction.reply({
            embeds: [errorEmbed(
              '❌ Twitch notifications are not enabled on this bot instance.',
            )],
            ephemeral: true,
          });
          return;
        }

        await interaction.deferReply({ ephemeral: true });

        if (platform === 'twitch') {
          // Coba ambil data stream real
          const stream = await TwitchAPI.getStream(username);

          if (stream) {
            // Streamer sedang live — kirim notifikasi real
            const twitchUser = await TwitchAPI.getUser(username);
            const embed = StreamNotifService.buildTestEmbed(platform, stream.user_name);

            embed.setTitle(`🔴 [TEST] ${stream.title}`);
            embed.setURL(`https://www.twitch.tv/${username}`);
            embed.spliceFields(0, 3,
              { name: '🎮 Game/Kategori', value: stream.game_name || 'N/A', inline: true },
              { name: '👥 Penonton', value: stream.viewer_count.toLocaleString(), inline: true },
              { name: '📺 Platform', value: 'Twitch', inline: true },
            );

            if (stream.thumbnail_url) {
              embed.setImage(
                stream.thumbnail_url.replace('{width}', '1280').replace('{height}', '720'),
              );
            }
            if (twitchUser?.profile_image_url) {
              embed.setThumbnail(twitchUser.profile_image_url);
            }

            await interaction.editReply({
              content: '✅ Streamer sedang **LIVE**! Berikut preview notifikasi:',
              embeds: [embed],
            });
          } else {
            // Offline — kirim placeholder
            const testEmbed = StreamNotifService.buildTestEmbed(platform, username);
            await interaction.editReply({
              content: '⚫ Streamer sedang **offline**. Berikut contoh notifikasi:',
              embeds: [testEmbed],
            });
          }
        } else {
          // YouTube test
          const result = await (await import('../../modules/streaming/YouTubeChecker.js')).default.checkLive(username);

          if (result && result.isLive) {
            const embed = StreamNotifService.buildTestEmbed(platform, username);
            embed.setTitle(`🔴 [TEST] ${result.title}`);
            embed.setURL(`https://www.youtube.com/watch?v=${result.videoId}`);
            if (result.thumbnail) {
              embed.setImage(result.thumbnail);
            }

            await interaction.editReply({
              content: '✅ Channel sedang **LIVE**! Berikut preview notifikasi:',
              embeds: [embed],
            });
          } else {
            const testEmbed = StreamNotifService.buildTestEmbed(platform, username);
            await interaction.editReply({
              content: '⚫ Channel sedang **offline**. Berikut contoh notifikasi:',
              embeds: [testEmbed],
            });
          }
        }
        break;
      }
    }

    logger.info(`Stream "${subcommand}" executed by ${interaction.user.tag} in ${interaction.guild.name}`);
  } catch (error) {
    logger.error('stream command error:', error);
    const reply = {
      embeds: [errorEmbed('❌ Terjadi kesalahan saat memproses perintah stream.')],
      ephemeral: true,
    };
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
}
