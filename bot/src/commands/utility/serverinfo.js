/**
 * LumigiaBOT — Perintah /serverinfo
 * Menampilkan informasi server secara detail termasuk anggota, channel,
 * status boost, dan tanggal pembuatan.
 */

import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { createEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { discordTimestamp } from '../../utils/TimeFormatter.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 5000;

export const data = new SlashCommandBuilder()
  .setName('serverinfo')
  .setDescription('Display detailed information about the server');

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    const { guild } = interaction;

    // Mengambil semua anggota untuk penghitungan yang akurat
    await guild.members.fetch().catch(() => {});

    const totalMembers = guild.memberCount;
    const botCount = guild.members.cache.filter((m) => m.user.bot).size;
    const humanCount = totalMembers - botCount;

    const textChannels = guild.channels.cache.filter(
      (c) => c.type === ChannelType.GuildText,
    ).size;
    const voiceChannels = guild.channels.cache.filter(
      (c) => c.type === ChannelType.GuildVoice,
    ).size;
    const totalChannels = guild.channels.cache.size;
    const roleCount = guild.roles.cache.size - 1; // Tidak termasuk @everyone

    const owner = await guild.fetchOwner().catch(() => null);
    const createdAt = discordTimestamp(guild.createdAt);

    // Tampilan level boost
    const boostTier = ['None', 'Level 1', 'Level 2', 'Level 3'];

    const embed = createEmbed('info')
      .setTitle(
        t(client, interaction.guildId, 'commands.serverinfo.title', {
          server: guild.name,
        }),
      )
      .addFields(
        {
          name: '👑 Owner',
          value: owner ? `${owner.user}` : '*Unknown*',
          inline: true,
        },
        {
          name: '🆔 Server ID',
          value: `\`${guild.id}\``,
          inline: true,
        },
        {
          name: '📅 Created',
          value: createdAt,
          inline: true,
        },
        {
          name: `👥 Members (${totalMembers})`,
          value: [
            `👤 Humans: **${humanCount}**`,
            `🤖 Bots: **${botCount}**`,
          ].join('\n'),
          inline: true,
        },
        {
          name: `💬 Channels (${totalChannels})`,
          value: [
            `📝 Text: **${textChannels}**`,
            `🔊 Voice: **${voiceChannels}**`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '🎭 Roles',
          value: `**${roleCount}** roles`,
          inline: true,
        },
        {
          name: '🚀 Boost Status',
          value: [
            `**Tier:** ${boostTier[guild.premiumTier] || 'None'}`,
            `**Boosts:** ${guild.premiumSubscriptionCount ?? 0}`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '🔒 Verification Level',
          value: `${guild.verificationLevel}`,
          inline: true,
        },
      );

    // Mengatur ikon guild sebagai thumbnail
    const iconUrl = guild.iconURL({ size: 512, dynamic: true });
    if (iconUrl) {
      embed.setThumbnail(iconUrl);
    }

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('serverinfo command error:', error);
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
  }
}
