/**
 * LumigiaBOT — Perintah /voice
 * Mengelola sistem Temporary Voice Channels (Join-to-Create).
 *
 * Subperintah:
 *   setup   — Atur hub channel dan kategori (ManageGuild)
 *   info    — Lihat pengaturan voice server (ManageGuild)
 *   limit   — Atur batas user di channel sementara kamu
 *   name    — Ubah nama channel sementara kamu
 *   lock    — Kunci channel sementara kamu
 *   unlock  — Buka kunci channel sementara kamu
 *   permit  — Izinkan user tertentu join channel yang dikunci
 *   kick    — Keluarkan user dari channel sementara kamu
 */

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} from 'discord.js';
import { logger } from '../../utils/Logger.js';
import VoiceService from '../../modules/voice/VoiceService.js';

/** Warna embed */
const COLORS = {
  SUCCESS: 0x43B581,
  ERROR: 0xF04747,
  INFO: 0x5865F2,
};

export const cooldown = 5000;

export const data = new SlashCommandBuilder()
  .setName('voice')
  .setDescription('Manage temporary voice channels')

  // ── setup (ManageGuild) ──
  .addSubcommand((sub) =>
    sub
      .setName('setup')
      .setDescription('Set up the Join-to-Create voice channel system')
      .addChannelOption((opt) =>
        opt
          .setName('channel')
          .setDescription('The hub voice channel users will join to create a channel')
          .addChannelTypes(ChannelType.GuildVoice)
          .setRequired(true),
      )
      .addChannelOption((opt) =>
        opt
          .setName('category')
          .setDescription('The category where temp channels will be created')
          .addChannelTypes(ChannelType.GuildCategory)
          .setRequired(true),
      ),
  )

  // ── info (ManageGuild) ──
  .addSubcommand((sub) =>
    sub
      .setName('info')
      .setDescription('Show current voice channel settings for this server'),
  )

  // ── limit ──
  .addSubcommand((sub) =>
    sub
      .setName('limit')
      .setDescription('Set user limit on your temp voice channel')
      .addIntegerOption((opt) =>
        opt
          .setName('number')
          .setDescription('User limit (0 = unlimited, max 99)')
          .setMinValue(0)
          .setMaxValue(99)
          .setRequired(true),
      ),
  )

  // ── name ──
  .addSubcommand((sub) =>
    sub
      .setName('name')
      .setDescription('Rename your temp voice channel')
      .addStringOption((opt) =>
        opt
          .setName('text')
          .setDescription('New channel name')
          .setMaxLength(100)
          .setRequired(true),
      ),
  )

  // ── lock ──
  .addSubcommand((sub) =>
    sub
      .setName('lock')
      .setDescription('Lock your temp voice channel (deny @everyone from connecting)'),
  )

  // ── unlock ──
  .addSubcommand((sub) =>
    sub
      .setName('unlock')
      .setDescription('Unlock your temp voice channel'),
  )

  // ── permit ──
  .addSubcommand((sub) =>
    sub
      .setName('permit')
      .setDescription('Allow a specific user to join your locked channel')
      .addUserOption((opt) =>
        opt
          .setName('user')
          .setDescription('The user to permit')
          .setRequired(true),
      ),
  )

  // ── kick ──
  .addSubcommand((sub) =>
    sub
      .setName('kick')
      .setDescription('Disconnect a user from your temp voice channel')
      .addUserOption((opt) =>
        opt
          .setName('user')
          .setDescription('The user to kick from your channel')
          .setRequired(true),
      ),
  )

  .setDMPermission(false);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const subcommand = interaction.options.getSubcommand();

  try {
    switch (subcommand) {
      case 'setup':
        await handleSetup(interaction, client);
        break;
      case 'info':
        await handleInfo(interaction, client);
        break;
      case 'limit':
        await handleLimit(interaction, client);
        break;
      case 'name':
        await handleName(interaction, client);
        break;
      case 'lock':
        await handleLock(interaction, client);
        break;
      case 'unlock':
        await handleUnlock(interaction, client);
        break;
      case 'permit':
        await handlePermit(interaction, client);
        break;
      case 'kick':
        await handleKick(interaction, client);
        break;
    }
  } catch (error) {
    logger.error(`voice command error (${subcommand}):`, error);
    const embed = new EmbedBuilder()
      .setColor(COLORS.ERROR)
      .setDescription('❌ An unexpected error occurred. Please try again later.');

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [embed], ephemeral: true }).catch(() => {});
    } else {
      await interaction.reply({ embeds: [embed], ephemeral: true }).catch(() => {});
    }
  }
}

// ════════════════════════════════════════════════
//  Subcommand: setup (ManageGuild)
// ════════════════════════════════════════════════

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleSetup(interaction, client) {
  // Cek izin ManageGuild
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({
      embeds: [errorEmbed('You need the **Manage Server** permission to use this command.')],
      ephemeral: true,
    });
  }

  const channel = interaction.options.getChannel('channel');
  const category = interaction.options.getChannel('category');

  // Simpan pengaturan
  client.db.voice.setSettings(interaction.guildId, channel.id, category.id);
  client.db.voice.updateSetting(interaction.guildId, 'enabled', 1);

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setTitle('🔊 Voice System Configured')
    .setDescription('Join-to-Create voice channel system has been set up!')
    .addFields(
      { name: '🎤 Hub Channel', value: `${channel}`, inline: true },
      { name: '📁 Category', value: `${category}`, inline: true },
    )
    .setTimestamp()
    .setFooter({ text: 'LumigiaBOT' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
  logger.info(`Voice setup configured by ${interaction.user.tag} in ${interaction.guild.name}`);
}

// ════════════════════════════════════════════════
//  Subcommand: info (ManageGuild)
// ════════════════════════════════════════════════

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleInfo(interaction, client) {
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({
      embeds: [errorEmbed('You need the **Manage Server** permission to use this command.')],
      ephemeral: true,
    });
  }

  const settings = client.db.voice.getSettings(interaction.guildId);

  if (!settings) {
    return interaction.reply({
      embeds: [errorEmbed('Voice system has not been configured yet. Use `/voice setup` first.')],
      ephemeral: true,
    });
  }

  const activeChannels = client.db.voice.getTempChannelsByGuild(interaction.guildId);

  const embed = new EmbedBuilder()
    .setColor(COLORS.INFO)
    .setTitle('🔊 Voice Channel Settings')
    .addFields(
      { name: '📌 Status', value: settings.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
      { name: '🎤 Hub Channel', value: settings.hub_channel_id ? `<#${settings.hub_channel_id}>` : 'Not set', inline: true },
      { name: '📁 Category', value: settings.category_id ? `<#${settings.category_id}>` : 'Not set', inline: true },
      { name: '👥 Default Limit', value: `${settings.default_limit || 'Unlimited'}`, inline: true },
      { name: '📝 Name Template', value: `\`${settings.default_name}\``, inline: true },
      { name: '🔢 Active Channels', value: `${activeChannels.length}`, inline: true },
    )
    .setTimestamp()
    .setFooter({ text: 'LumigiaBOT' });

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// ════════════════════════════════════════════════
//  Subcommand: limit
// ════════════════════════════════════════════════

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleLimit(interaction, client) {
  const { channel, tempData } = await requireOwnedChannel(interaction, client);
  if (!channel) return; // Sudah di-reply oleh requireOwnedChannel

  const limit = interaction.options.getInteger('number');

  // Update di Discord
  await channel.setUserLimit(limit);

  // Update di database
  client.db.voice.updateTempChannel(channel.id, 'user_limit', limit);

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setDescription(`✅ User limit set to **${limit === 0 ? 'unlimited' : limit}**.`);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// ════════════════════════════════════════════════
//  Subcommand: name
// ════════════════════════════════════════════════

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleName(interaction, client) {
  const { channel, tempData } = await requireOwnedChannel(interaction, client);
  if (!channel) return;

  const newName = interaction.options.getString('text');

  // Update di Discord
  await channel.setName(newName);

  // Update di database
  client.db.voice.updateTempChannel(channel.id, 'name', newName);

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setDescription(`✅ Channel renamed to **${newName}**.`);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// ════════════════════════════════════════════════
//  Subcommand: lock
// ════════════════════════════════════════════════

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleLock(interaction, client) {
  const { channel, tempData } = await requireOwnedChannel(interaction, client);
  if (!channel) return;

  // Tolak @everyone dari Connect
  await channel.permissionOverwrites.edit(interaction.guildId, {
    Connect: false,
  });

  // Update di database
  client.db.voice.updateTempChannel(channel.id, 'locked', 1);

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setDescription('🔒 Your voice channel has been **locked**. No one can join unless permitted.');

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// ════════════════════════════════════════════════
//  Subcommand: unlock
// ════════════════════════════════════════════════

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleUnlock(interaction, client) {
  const { channel, tempData } = await requireOwnedChannel(interaction, client);
  if (!channel) return;

  // Reset @everyone Connect ke null (inherits from category)
  await channel.permissionOverwrites.edit(interaction.guildId, {
    Connect: null,
  });

  // Update di database
  client.db.voice.updateTempChannel(channel.id, 'locked', 0);

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setDescription('🔓 Your voice channel has been **unlocked**. Everyone can join now.');

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// ════════════════════════════════════════════════
//  Subcommand: permit
// ════════════════════════════════════════════════

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handlePermit(interaction, client) {
  const { channel, tempData } = await requireOwnedChannel(interaction, client);
  if (!channel) return;

  const targetUser = interaction.options.getUser('user');

  if (targetUser.id === interaction.user.id) {
    return interaction.reply({
      embeds: [errorEmbed("You can't permit yourself — you already own this channel!")],
      ephemeral: true,
    });
  }

  // Izinkan user tertentu Connect
  await channel.permissionOverwrites.edit(targetUser.id, {
    Connect: true,
  });

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setDescription(`✅ ${targetUser} has been **permitted** to join your voice channel.`);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// ════════════════════════════════════════════════
//  Subcommand: kick
// ════════════════════════════════════════════════

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleKick(interaction, client) {
  const { channel, tempData } = await requireOwnedChannel(interaction, client);
  if (!channel) return;

  const targetUser = interaction.options.getUser('user');

  if (targetUser.id === interaction.user.id) {
    return interaction.reply({
      embeds: [errorEmbed("You can't kick yourself from your own channel!")],
      ephemeral: true,
    });
  }

  // Cek apakah target ada di channel
  const targetMember = channel.members.get(targetUser.id);
  if (!targetMember) {
    return interaction.reply({
      embeds: [errorEmbed(`${targetUser} is not in your voice channel.`)],
      ephemeral: true,
    });
  }

  // Disconnect user dari voice channel
  await targetMember.voice.disconnect('Kicked by channel owner');

  const embed = new EmbedBuilder()
    .setColor(COLORS.SUCCESS)
    .setDescription(`✅ ${targetUser} has been **disconnected** from your voice channel.`);

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// ════════════════════════════════════════════════
//  Helper Functions
// ════════════════════════════════════════════════

/**
 * Memeriksa apakah user sedang berada di voice channel sementara miliknya.
 * Jika tidak, membalas dengan pesan error dan mengembalikan null.
 *
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 * @returns {Promise<{channel: import('discord.js').VoiceChannel|null, tempData: object|null}>}
 */
async function requireOwnedChannel(interaction, client) {
  const member = interaction.member;

  // Cek apakah user ada di voice channel
  if (!member.voice.channelId) {
    await interaction.reply({
      embeds: [errorEmbed('You must be in a voice channel to use this command.')],
      ephemeral: true,
    });
    return { channel: null, tempData: null };
  }

  const channelId = member.voice.channelId;

  // Cek apakah channel adalah temp channel
  const tempData = client.db.voice.getTempChannel(channelId);
  if (!tempData) {
    await interaction.reply({
      embeds: [errorEmbed('You are not in a temporary voice channel.')],
      ephemeral: true,
    });
    return { channel: null, tempData: null };
  }

  // Cek apakah user adalah pemilik channel
  if (!VoiceService.isOwner(client, channelId, interaction.user.id)) {
    await interaction.reply({
      embeds: [errorEmbed("You don't own this channel.")],
      ephemeral: true,
    });
    return { channel: null, tempData: null };
  }

  const channel = member.voice.channel;
  return { channel, tempData };
}

/**
 * Membuat embed error standar.
 * @param {string} description
 * @returns {EmbedBuilder}
 */
function errorEmbed(description) {
  return new EmbedBuilder()
    .setColor(COLORS.ERROR)
    .setDescription(`❌ ${description}`);
}
