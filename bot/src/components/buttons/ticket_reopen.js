/**
 * LumigiaBOT — Penanganan Tombol ticket_reopen
 * Membuka kembali tiket yang sebelumnya ditutup.
 */

import { t } from '../../i18n/helpers.js';
import { errorEmbed } from '../../utils/EmbedBuilder.js';
import { reopenTicket } from '../../modules/tickets/TicketService.js';
import { logger } from '../../utils/Logger.js';

export const customId = 'ticket_reopen';

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    // Verifikasi bahwa ini adalah channel tiket
    const ticket = client.db.tickets.getByChannel(interaction.channel.id);
    if (!ticket) {
      const msg = t(client, interaction.guildId, 'commands.ticket.not_found');
      return interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
    }

    // --- Periksa apakah sudah terbuka ---
    if (ticket.status === 'open') {
      return interaction.reply({
        embeds: [errorEmbed('⚠️ This ticket is already open.')],
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    // Buka kembali tiket
    await reopenTicket(client, interaction.channel, interaction.user);

    logger.info(`Ticket reopened via button by ${interaction.user.tag}`);
  } catch (error) {
    logger.error('ticket_reopen button error:', error);

    const msg = t(client, interaction.guildId, 'errors.unknown');
    if (interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
    } else if (!interaction.replied) {
      await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
    }
  }
}
