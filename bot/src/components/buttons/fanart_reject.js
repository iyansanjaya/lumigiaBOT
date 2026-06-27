/**
 * LumigiaBOT — Penanganan Tombol fanart_reject
 * Menangani klik tombol reject fan art submission.
 * Menampilkan modal untuk memasukkan alasan penolakan.
 * Menggunakan startsWith matching dengan format: fanart_reject_{submissionId}
 */

import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  PermissionFlagsBits,
} from 'discord.js';
import { logger } from '../../utils/Logger.js';

export const customId = 'fanart_reject';
export const startsWith = true;

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    // Cek izin ManageGuild
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: '❌ You need **Manage Server** permission to reject fan art.',
        ephemeral: true,
      });
    }

    // Parse submissionId dari customId: fanart_reject_{id}
    const parts = interaction.customId.split('_');
    // parts = ['fanart', 'reject', submissionId]
    const submissionId = parseInt(parts[2], 10);

    if (isNaN(submissionId)) {
      return interaction.reply({
        content: '❌ Invalid submission data.',
        ephemeral: true,
      });
    }

    // Cek submission ada
    const submission = client.db.fanArt.get(submissionId);
    if (!submission) {
      return interaction.reply({
        content: '❌ This submission no longer exists.',
        ephemeral: true,
      });
    }

    // Cek belum di-review
    if (submission.status !== 'pending') {
      return interaction.reply({
        content: `❌ This submission has already been **${submission.status}**.`,
        ephemeral: true,
      });
    }

    // Tampilkan modal untuk alasan penolakan
    const modal = new ModalBuilder()
      .setCustomId(`fanart_reject_reason_${submissionId}`)
      .setTitle('❌ Reject Fan Art');

    const reasonInput = new TextInputBuilder()
      .setCustomId('reason')
      .setLabel('Reason for rejection')
      .setPlaceholder('Explain why this submission is being rejected...')
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true)
      .setMaxLength(500);

    modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

    await interaction.showModal(modal);
  } catch (error) {
    logger.error('fanart_reject button error:', error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ An error occurred while processing the rejection.',
        ephemeral: true,
      }).catch(() => {});
    }
  }
}
