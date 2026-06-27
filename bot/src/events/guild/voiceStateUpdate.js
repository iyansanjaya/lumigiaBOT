/**
 * LumigiaBOT — Event Voice State Update
 * Menangani sistem Join-to-Create voice channel.
 * Membuat channel sementara saat user join hub, dan menghapusnya saat kosong.
 */

import { logger } from '../../utils/Logger.js';
import VoiceService from '../../modules/voice/VoiceService.js';

export const name = 'voiceStateUpdate';
export const once = false;

/**
 * @param {import('discord.js').VoiceState} oldState - State sebelumnya
 * @param {import('discord.js').VoiceState} newState - State saat ini
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(oldState, newState, client) {
  // Abaikan jika database belum siap
  if (!client.db) return;

  const guildId = newState.guild?.id || oldState.guild?.id;
  if (!guildId) return;

  try {
    // ── User JOIN atau SWITCH ke channel baru ──
    if (newState.channelId && newState.channelId !== oldState.channelId) {
      await handleJoin(newState, client);
    }

    // ── User LEAVE atau SWITCH dari channel lama ──
    if (oldState.channelId && oldState.channelId !== newState.channelId) {
      await handleLeave(oldState, client);
    }
  } catch (err) {
    logger.error(`voiceStateUpdate error in guild ${guildId}:`, err);
  }
}

/**
 * Menangani user yang join voice channel.
 * Jika channel adalah hub Join-to-Create, buat channel sementara.
 *
 * @param {import('discord.js').VoiceState} state
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleJoin(state, client) {
  const settings = client.db.voice.getSettings(state.guild.id);
  if (!settings || !settings.enabled) return;

  // Cek apakah channel yang di-join adalah hub channel
  if (state.channelId !== settings.hub_channel_id) return;

  const member = state.member;
  if (!member) return;

  try {
    await VoiceService.createTempChannel(client, member, state.channel);
  } catch (err) {
    logger.error(`Failed to create temp channel for ${member.user.tag}:`, err);
  }
}

/**
 * Menangani user yang leave voice channel.
 * Jika channel adalah temp_channel dan sudah kosong, hapus.
 *
 * @param {import('discord.js').VoiceState} state
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleLeave(state, client) {
  const channelId = state.channelId;

  // Cek apakah channel yang ditinggalkan adalah channel sementara
  const tempChannel = client.db.voice.getTempChannel(channelId);
  if (!tempChannel) return;

  // Ambil channel dari Discord untuk cek jumlah member
  let channel;
  try {
    channel = await state.guild.channels.fetch(channelId);
  } catch {
    // Channel sudah tidak ada, bersihkan dari DB
    client.db.voice.removeTempChannel(channelId);
    return;
  }

  if (!channel) {
    client.db.voice.removeTempChannel(channelId);
    return;
  }

  // Hapus jika channel kosong
  if (channel.members.size === 0) {
    await VoiceService.deleteTempChannel(client, channel);
  }
}
