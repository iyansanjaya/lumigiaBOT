/**
 * LumigiaBOT — Perintah /slowmode
 * Mengatur atau menonaktifkan slowmode pada channel.
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { parseDuration, formatDuration } from '../../utils/TimeFormatter.js';
import { Cooldowns, Limits } from '../../config/constants.js';

/** @type {number} */
export const cooldown = Cooldowns.MODERATION;

export const data = new SlashCommandBuilder()
  .setName('slowmode')
  .setDescription('Set slowmode on a channel')
  .addStringOption((opt) =>
    opt
      .setName('duration')
      .setDescription('Slowmode interval (e.g. 5s, 1m, 6h) — use "0" or "off" to disable')
      .setRequired(true),
  )
  .addChannelOption((opt) =>
    opt.setName('channel').setDescription('Target channel (defaults to current)').setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const durationStr = interaction.options.getString('duration');
  const channel = interaction.options.getChannel('channel') ?? interaction.channel;

  try {
    // Memeriksa kata kunci penonaktifan
    if (durationStr === '0' || durationStr.toLowerCase() === 'off') {
      await channel.setRateLimitPerUser(0, `Slowmode disabled by ${interaction.user.tag}`);

      client.db.auditLogs.add(
        interaction.guildId, 'SLOWMODE', interaction.user.id, channel.id,
        'Disabled slowmode',
      );

      const msg = t(client, interaction.guildId, 'commands.slowmode.disabled', {
        channel: `${channel}`,
      });
      return interaction.reply({ embeds: [successEmbed(msg)] });
    }

    // Mengurai durasi
    const durationMs = parseDuration(durationStr);
    if (!durationMs) {
      return interaction.reply({
        embeds: [errorEmbed('❌ Invalid duration format. Use formats like `5s`, `1m`, `6h`.')],
        ephemeral: true,
      });
    }

    // Mengonversi ke detik dan menerapkan batas maksimum
    const seconds = Math.floor(durationMs / 1000);
    if (seconds > Limits.SLOWMODE_MAX) {
      return interaction.reply({
        embeds: [errorEmbed(`❌ Maximum slowmode is **${formatDuration(Limits.SLOWMODE_MAX * 1000)}**.`)],
        ephemeral: true,
      });
    }

    await channel.setRateLimitPerUser(seconds, `Slowmode set by ${interaction.user.tag}`);

    client.db.auditLogs.add(
      interaction.guildId, 'SLOWMODE', interaction.user.id, channel.id,
      `Set slowmode to ${formatDuration(durationMs)}`,
    );

    const msg = t(client, interaction.guildId, 'commands.slowmode.success', {
      duration: formatDuration(durationMs),
      channel: `${channel}`,
    });
    await interaction.reply({ embeds: [successEmbed(msg)] });
  } catch (error) {
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
  }
}
