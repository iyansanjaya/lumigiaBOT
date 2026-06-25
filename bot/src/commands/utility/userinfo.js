/**
 * LumigiaBOT — Perintah /userinfo
 * Menampilkan informasi pengguna secara detail termasuk role, tanggal bergabung,
 * usia akun, dan avatar.
 */

import { SlashCommandBuilder } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { createEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { discordTimestamp } from '../../utils/TimeFormatter.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 5000;

export const data = new SlashCommandBuilder()
  .setName('userinfo')
  .setDescription('Display information about a user')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('User to look up (defaults to yourself)')
      .setRequired(false),
  );

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    const user = interaction.options.getUser('user') || interaction.user;

    // Mengambil anggota guild untuk informasi role
    let member;
    try {
      member = await interaction.guild.members.fetch(user.id);
    } catch {
      member = null;
    }

    const createdAt = discordTimestamp(user.createdAt);
    const joinedAt = member?.joinedAt ? discordTimestamp(member.joinedAt) : '*Not in server*';

    // Membuat daftar role (10 teratas, tidak termasuk @everyone)
    let roleDisplay = '*None*';
    if (member) {
      const roles = member.roles.cache
        .filter((r) => r.id !== interaction.guild.id) // Tidak termasuk @everyone
        .sort((a, b) => b.position - a.position)
        .first(10)
        .map((r) => `${r}`);

      const totalRoles = member.roles.cache.size - 1;
      if (roles.length > 0) {
        roleDisplay = roles.join(', ');
        if (totalRoles > 10) {
          roleDisplay += ` *+${totalRoles - 10} more*`;
        }
      }
    }

    // Perhitungan usia akun
    const accountAge = Math.floor(
      (Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24),
    );

    const embed = createEmbed('info')
      .setTitle(
        t(client, interaction.guildId, 'commands.userinfo.title', {
          user: user.tag,
        }),
      )
      .setThumbnail(user.displayAvatarURL({ size: 512, dynamic: true }))
      .addFields(
        {
          name: '👤 Username',
          value: `${user.tag}`,
          inline: true,
        },
        {
          name: '📛 Display Name',
          value: member?.displayName || user.displayName || user.username,
          inline: true,
        },
        {
          name: '🆔 User ID',
          value: `\`${user.id}\``,
          inline: true,
        },
        {
          name: '📅 Account Created',
          value: `${createdAt}\n(${accountAge} days ago)`,
          inline: true,
        },
        {
          name: '📥 Joined Server',
          value: joinedAt,
          inline: true,
        },
        {
          name: '🤖 Bot',
          value: user.bot ? 'Yes' : 'No',
          inline: true,
        },
        {
          name: `🎭 Roles${member ? ` (${member.roles.cache.size - 1})` : ''}`,
          value: roleDisplay,
        },
      );

    // Menampilkan role tertinggi jika berada di guild
    if (member && member.roles.highest.id !== interaction.guild.id) {
      embed.addFields({
        name: '👑 Highest Role',
        value: `${member.roles.highest}`,
        inline: true,
      });
    }

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('userinfo command error:', error);
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
  }
}
