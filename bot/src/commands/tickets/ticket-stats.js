/**
 * LumigiaBOT — Perintah /ticket-stats
 * Menampilkan statistik tiket untuk server.
 * Membutuhkan izin ManageGuild.
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { createEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 5000;

export const data = new SlashCommandBuilder()
  .setName('ticket-stats')
  .setDescription('View ticket statistics for this server')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    const stats = client.db.tickets.getStats(interaction.guildId);

    const embed = createEmbed('ticket')
      .setTitle('📊 Ticket Statistics')
      .addFields(
        { name: '📩 Total Tickets', value: `${stats?.total ?? 0}`, inline: true },
        { name: '🟢 Open', value: `${stats?.open ?? 0}`, inline: true },
        { name: '👋 Claimed', value: `${stats?.claimed ?? 0}`, inline: true },
        { name: '🔒 Closed', value: `${stats?.closed ?? 0}`, inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('ticket-stats error:', error);
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
  }
}
