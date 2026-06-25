/**
 * LumigiaBOT — Penanganan Tombol ticket_claim
 * Menetapkan tiket ke anggota staf yang mengklik tombol.
 * Memerlukan role support atau izin ManageGuild.
 */

import { PermissionFlagsBits } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { errorEmbed } from '../../utils/EmbedBuilder.js';
import { claimTicket } from '../../modules/tickets/TicketService.js';
import { logger } from '../../utils/Logger.js';

export const customId = 'ticket_claim';

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

    // --- Pemeriksaan izin: harus memiliki role support atau ManageGuild ---
    const settings = client.db.guildSettings.get(interaction.guildId);
    const hasManageGuild = interaction.member.permissions.has(PermissionFlagsBits.ManageGuild);
    const hasSupportRole = settings?.ticket_support_role
      ? interaction.member.roles.cache.has(settings.ticket_support_role)
      : false;

    if (!hasManageGuild && !hasSupportRole) {
      const msg = t(client, interaction.guildId, 'errors.no_permission');
      return interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
    }

    // --- Periksa apakah sudah diklaim ---
    if (ticket.status === 'claimed') {
      return interaction.reply({
        embeds: [errorEmbed(`⚠️ This ticket is already claimed by <@${ticket.claimed_by}>.`)],
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    // Klaim tiket
    await claimTicket(client, interaction.channel, interaction.member);

    logger.info(`Ticket claimed via button by ${interaction.user.tag}`);
  } catch (error) {
    logger.error('ticket_claim button error:', error);

    const msg = t(client, interaction.guildId, 'errors.unknown');
    if (interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
    } else if (!interaction.replied) {
      await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
    }
  }
}
