/**
 * LumigiaBOT — Penanganan Modal fanart_reject_reason
 * Menangani pengiriman modal alasan penolakan fan art.
 * Menggunakan startsWith matching dengan format: fanart_reject_reason_{submissionId}
 */

import { EmbedBuilder } from 'discord.js';
import FanArtService from '../../modules/fanart/FanArtService.js';
import { logger } from '../../utils/Logger.js';

export const customId = 'fanart_reject_reason';
export const startsWith = true;

/** Warna embed */
const COLORS = {
  ERROR: 0xF04747,
};

/**
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    // Parse submissionId dari customId: fanart_reject_reason_{id}
    const parts = interaction.customId.split('_');
    // parts = ['fanart', 'reject', 'reason', submissionId]
    const submissionId = parseInt(parts[3], 10);

    if (isNaN(submissionId)) {
      return interaction.reply({
        content: '❌ Invalid submission data.',
        ephemeral: true,
      });
    }

    const submission = client.db.fanArt.get(submissionId);
    if (!submission) {
      return interaction.reply({
        content: '❌ This submission no longer exists.',
        ephemeral: true,
      });
    }

    // Cek belum di-review (race condition guard)
    if (submission.status !== 'pending') {
      return interaction.reply({
        content: `❌ This submission has already been **${submission.status}**.`,
        ephemeral: true,
      });
    }

    await interaction.deferUpdate();

    // Ambil alasan dari input modal
    const reason = interaction.fields.getTextInputValue('reason');

    // Reject via service
    await FanArtService.rejectArt(client, submission, interaction.user.id, reason);

    // Update pesan asli untuk menampilkan status rejected
    const originalMessage = interaction.message;
    if (originalMessage && originalMessage.embeds.length > 0) {
      const updatedEmbed = EmbedBuilder.from(originalMessage.embeds[0])
        .setColor(COLORS.ERROR)
        .setFields([
          { name: 'Status', value: `❌ Rejected by <@${interaction.user.id}>`, inline: true },
          { name: 'Reason', value: reason, inline: false },
          { name: 'Reviewed At', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
        ]);

      await interaction.editReply({
        embeds: [updatedEmbed],
        components: [], // Hapus tombol
      });
    }

    logger.info(`Fan art #${submissionId} rejected by ${interaction.user.tag} — reason: "${reason}"`);
  } catch (error) {
    logger.error('fanart_reject_reason modal error:', error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ An error occurred while rejecting this submission.',
        ephemeral: true,
      }).catch(() => {});
    }
  }
}
