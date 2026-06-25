/**
 * LumigiaBOT — Penanganan Tombol ticket_create
 * Menangani klik tombol "Buka Tiket" dari panel tiket.
 * Memeriksa batas tiket, lalu menampilkan modal untuk alasan tiket.
 */

import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { errorEmbed } from '../../utils/EmbedBuilder.js';
import { TicketDefaults, Limits } from '../../config/constants.js';
import { logger } from '../../utils/Logger.js';

export const customId = 'ticket_create';

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    const { guildId, user } = interaction;
    const settings = client.db.guildSettings.get(guildId);
    const maxOpen = settings?.ticket_max_open || TicketDefaults.MAX_OPEN;

    // --- Periksa batas tiket ---
    const openCount = client.db.tickets.countOpenByUser(guildId, user.id);
    if (openCount >= maxOpen) {
      const msg = t(client, guildId, 'commands.ticket.already_open');
      return interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
    }

    // --- Tampilkan modal alasan ---
    const modal = new ModalBuilder()
      .setCustomId('ticket_reason')
      .setTitle('📩 Open a Ticket');

    const reasonInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Reason for your ticket')
      .setPlaceholder('Describe your issue or question...')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false)
      .setMaxLength(Limits.TICKET_REASON_MAX);

    modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

    await interaction.showModal(modal);
  } catch (error) {
    logger.error('ticket_create button error:', error);

    const msg = t(client, interaction.guildId, 'errors.unknown');
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
    }
  }
}
