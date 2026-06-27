/**
 * LumigiaBOT — Penanganan Tombol fanart_approve
 * Menangani klik tombol approve fan art submission.
 * Menggunakan startsWith matching untuk mencocokkan customId dinamis
 * dengan format: fanart_approve_{submissionId}
 */

import { EmbedBuilder, PermissionFlagsBits } from 'discord.js';
import FanArtService from '../../modules/fanart/FanArtService.js';
import { logger } from '../../utils/Logger.js';

export const customId = 'fanart_approve';
export const startsWith = true;

/** Warna embed */
const COLORS = {
  SUCCESS: 0x43B581,
  ERROR: 0xF04747,
};

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    // Cek izin ManageGuild
    if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
      return interaction.reply({
        content: '❌ You need **Manage Server** permission to approve fan art.',
        ephemeral: true,
      });
    }

    // Parse submissionId dari customId: fanart_approve_{id}
    const parts = interaction.customId.split('_');
    // parts = ['fanart', 'approve', submissionId]
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

    await interaction.deferUpdate();

    // Approve via service
    await FanArtService.approveArt(client, submission, interaction.user.id);

    // Update pesan asli untuk menampilkan status approved
    const updatedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
      .setColor(COLORS.SUCCESS)
      .setFields([
        { name: 'Status', value: `✅ Approved by <@${interaction.user.id}>`, inline: true },
        { name: 'Reviewed At', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true },
      ]);

    await interaction.editReply({
      embeds: [updatedEmbed],
      components: [], // Hapus tombol
    });

    logger.info(`Fan art #${submissionId} approved by ${interaction.user.tag}`);
  } catch (error) {
    logger.error('fanart_approve button error:', error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ An error occurred while approving this submission.',
        ephemeral: true,
      }).catch(() => {});
    }
  }
}
