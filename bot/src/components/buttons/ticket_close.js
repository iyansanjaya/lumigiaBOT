/**
 * LumigiaBOT — Penanganan Tombol ticket_close
 * Menutup channel tiket saat ini, membuat transkrip terlebih dahulu.
 */

import { t } from '../../i18n/helpers.js';
import { errorEmbed } from '../../utils/EmbedBuilder.js';
import { closeTicket } from '../../modules/tickets/TicketService.js';
import { logger } from '../../utils/Logger.js';

export const customId = 'ticket_close';

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

    // Konfirmasi interaksi selagi kita memproses
    await interaction.deferReply();

    // Tutup tiket (membuat transkrip, menjadwalkan penghapusan channel)
    await closeTicket(client, interaction.channel, interaction.user);

    logger.info(`Ticket closed via button by ${interaction.user.tag}`);
  } catch (error) {
    logger.error('ticket_close button error:', error);

    const msg = t(client, interaction.guildId, 'errors.unknown');
    if (interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
    } else if (!interaction.replied) {
      await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
    }
  }
}
