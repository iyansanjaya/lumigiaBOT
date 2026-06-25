/**
 * LumigiaBOT — Penanganan Modal ticket_reason
 * Menangani pengiriman modal alasan tiket.
 * Membuat channel tiket dengan alasan yang diberikan.
 */

import { t } from '../../i18n/helpers.js';
import { successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { createTicket } from '../../modules/tickets/TicketService.js';
import { logger } from '../../utils/Logger.js';

export const customId = 'ticket_reason';

/**
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    await interaction.deferReply({ ephemeral: true });

    // Ambil alasan dari input modal
    const reason = interaction.fields.getTextInputValue('reason') || 'No reason provided';

    // Tentukan kategori — periksa apakah ada yang di-cache dari menu pilihan
    let category = 'general';
    if (client._ticketCategoryCache) {
      const cacheKey = `${interaction.guildId}-${interaction.user.id}`;
      const cached = client._ticketCategoryCache.get(cacheKey);
      if (cached) {
        category = cached;
        client._ticketCategoryCache.delete(cacheKey);
      }
    }

    // Buat tiket
    const channel = await createTicket(
      client,
      interaction.guild,
      interaction.user,
      category,
      reason,
    );

    // Balas dengan sukses
    const msg = t(client, interaction.guildId, 'commands.ticket.created', {
      channel: `${channel}`,
    });
    await interaction.editReply({ embeds: [successEmbed(msg)] });
  } catch (error) {
    // Tangani error batas tiket
    if (error.message === 'TICKET_LIMIT_REACHED') {
      const msg = t(client, interaction.guildId, 'commands.ticket.already_open');
      return interaction.editReply({ embeds: [errorEmbed(msg)] });
    }

    logger.error('ticket_reason modal error:', error);
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.editReply({ embeds: [errorEmbed(msg)] }).catch(() => {});
  }
}
