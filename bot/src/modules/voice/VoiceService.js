/**
 * LumigiaBOT — Layanan Voice Channel Sementara
 * Logika bisnis inti untuk sistem Join-to-Create voice channel.
 * Menangani pembuatan, penghapusan, dan pembersihan channel sementara.
 */

import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { logger } from '../../utils/Logger.js';

export default class VoiceService {
  /**
   * Membuat channel voice sementara dan memindahkan member ke dalamnya.
   *
   * @param {import('../../core/BotClient.js').default} client
   * @param {import('discord.js').GuildMember} member - Member yang join hub channel
   * @param {import('discord.js').VoiceChannel} hubChannel - Hub channel Join-to-Create
   * @returns {Promise<import('discord.js').VoiceChannel>} Channel voice sementara yang dibuat
   */
  static async createTempChannel(client, member, hubChannel) {
    const settings = client.db.voice.getSettings(member.guild.id);
    if (!settings) {
      throw new Error('VOICE_NOT_CONFIGURED');
    }

    // Cek apakah user sudah punya channel sementara
    const existing = client.db.voice.getTempChannelByOwner(member.guild.id, member.id);
    if (existing) {
      // Pindahkan ke channel yang sudah ada jika masih ada di Discord
      try {
        const existingChannel = await member.guild.channels.fetch(existing.channel_id);
        if (existingChannel) {
          await member.voice.setChannel(existingChannel);
          return existingChannel;
        }
      } catch {
        // Channel tidak ada lagi, bersihkan dari DB
        client.db.voice.removeTempChannel(existing.channel_id);
      }
    }

    // Buat nama channel dari template
    const channelName = (settings.default_name || "{user}'s Channel")
      .replace('{user}', member.displayName);

    // Buat channel voice sementara
    const tempChannel = await member.guild.channels.create({
      name: channelName,
      type: ChannelType.GuildVoice,
      parent: settings.category_id || hubChannel.parentId,
      userLimit: settings.default_limit || 0,
      permissionOverwrites: [
        // Berikan pemilik izin mengelola channel mereka
        {
          id: member.id,
          allow: [
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.MuteMembers,
            PermissionFlagsBits.DeafenMembers,
            PermissionFlagsBits.MoveMembers,
          ],
        },
      ],
      reason: `Temp voice channel created for ${member.user.tag}`,
    });

    // Simpan ke database
    client.db.voice.addTempChannel(tempChannel.id, member.guild.id, member.id, channelName);

    // Pindahkan member ke channel baru
    try {
      await member.voice.setChannel(tempChannel);
    } catch (err) {
      // Jika gagal pindahkan, hapus channel yang baru dibuat
      logger.warn(`Failed to move ${member.user.tag} to temp channel, cleaning up:`, err.message);
      await tempChannel.delete('Failed to move user').catch(() => {});
      client.db.voice.removeTempChannel(tempChannel.id);
      throw err;
    }

    logger.info(
      `Temp voice channel "${channelName}" created by ${member.user.tag} in ${member.guild.name}`
    );

    return tempChannel;
  }

  /**
   * Menghapus channel voice sementara dan membersihkan dari database.
   *
   * @param {import('../../core/BotClient.js').default} client
   * @param {import('discord.js').VoiceChannel} channel - Channel voice yang akan dihapus
   */
  static async deleteTempChannel(client, channel) {
    const tempData = client.db.voice.getTempChannel(channel.id);
    if (!tempData) return;

    // Hapus dari database terlebih dahulu
    client.db.voice.removeTempChannel(channel.id);

    // Hapus channel dari Discord
    try {
      await channel.delete('Temp voice channel is empty');
      logger.info(`Temp voice channel "${channel.name}" (${channel.id}) deleted — empty`);
    } catch (err) {
      logger.warn(`Failed to delete temp channel ${channel.id}:`, err.message);
    }
  }

  /**
   * Memeriksa apakah user adalah pemilik channel sementara.
   *
   * @param {import('../../core/BotClient.js').default} client
   * @param {string} channelId - ID channel yang diperiksa
   * @param {string} userId - ID user yang diperiksa
   * @returns {boolean}
   */
  static isOwner(client, channelId, userId) {
    const tempChannel = client.db.voice.getTempChannel(channelId);
    if (!tempChannel) return false;
    return tempChannel.owner_id === userId;
  }

  /**
   * Membersihkan semua channel sementara kosong untuk guild.
   * Berguna saat bot restart atau untuk pembersihan berkala.
   *
   * @param {import('../../core/BotClient.js').default} client
   * @param {string} guildId
   */
  static async cleanupEmptyChannels(client, guildId) {
    const tempChannels = client.db.voice.getTempChannelsByGuild(guildId);
    if (!tempChannels.length) return;

    let guild;
    try {
      guild = await client.guilds.fetch(guildId);
    } catch {
      // Guild tidak dapat diakses, bersihkan semua record
      for (const ch of tempChannels) {
        client.db.voice.removeTempChannel(ch.channel_id);
      }
      return;
    }

    const existingChannelIds = [];

    for (const ch of tempChannels) {
      try {
        const channel = await guild.channels.fetch(ch.channel_id);
        if (channel) {
          // Channel masih ada — cek apakah kosong
          if (channel.members.size === 0) {
            await channel.delete('Cleanup: temp voice channel is empty').catch(() => {});
            client.db.voice.removeTempChannel(ch.channel_id);
            logger.info(`Cleanup: deleted empty temp channel "${ch.name}" (${ch.channel_id})`);
          } else {
            existingChannelIds.push(ch.channel_id);
          }
        } else {
          // Channel null — sudah tidak ada
          client.db.voice.removeTempChannel(ch.channel_id);
        }
      } catch {
        // Channel tidak ditemukan di Discord — bersihkan dari DB
        client.db.voice.removeTempChannel(ch.channel_id);
        logger.debug(`Cleanup: removed stale channel record ${ch.channel_id}`);
      }
    }
  }
}
