/**
 * LumigiaBOT — Perintah /ticket-setup
 * Mengirim panel tiket (embed + tombol) ke channel yang ditentukan.
 * Membutuhkan izin ManageGuild.
 */

import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { buildTicketPanel } from '../../modules/tickets/TicketPanel.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 10000;

export const data = new SlashCommandBuilder()
  .setName('ticket-setup')
  .setDescription('Send the ticket creation panel to a channel')
  .addChannelOption((option) =>
    option
      .setName('channel')
      .setDescription('Channel to send the ticket panel to')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    const channel = interaction.options.getChannel('channel');

    // Membangun panel tiket
    const panel = buildTicketPanel(client, interaction.guildId);

    // Mengirim panel ke channel tujuan
    await channel.send({ embeds: panel.embeds, components: panel.components });

    // Membalas ke admin
    const msg = `📩 Ticket panel sent to ${channel}!`;
    await interaction.reply({ embeds: [successEmbed(msg)], ephemeral: true });

    logger.info(`Ticket panel set up in #${channel.name} by ${interaction.user.tag}`);
  } catch (error) {
    logger.error('ticket-setup error:', error);
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
  }
}
