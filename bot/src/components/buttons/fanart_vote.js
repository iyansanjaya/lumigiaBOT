/**
 * LumigiaBOT — Penanganan Tombol fanart_vote
 * Menangani klik tombol vote fan art di gallery channel.
 * Toggle: klik pertama = vote, klik kedua = unvote.
 * Menggunakan startsWith matching untuk mencocokkan customId dinamis
 * dengan format: fanart_vote_{submissionId}
 */

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { logger } from '../../utils/Logger.js';

export const customId = 'fanart_vote';
export const startsWith = true;

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    // Parse submissionId dari customId: fanart_vote_{id}
    const parts = interaction.customId.split('_');
    // parts = ['fanart', 'vote', submissionId]
    const submissionId = parseInt(parts[2], 10);

    if (isNaN(submissionId)) {
      return interaction.reply({
        content: '❌ Data submission tidak valid.',
        ephemeral: true,
      });
    }

    // Cek submission ada dan statusnya approved
    const submission = client.db.fanArt.get(submissionId);
    if (!submission) {
      return interaction.reply({
        content: '❌ Submission ini sudah tidak ada.',
        ephemeral: true,
      });
    }

    if (submission.status !== 'approved') {
      return interaction.reply({
        content: '❌ Submission ini belum disetujui.',
        ephemeral: true,
      });
    }

    await interaction.deferUpdate();

    // Toggle vote
    const voted = client.db.fanArt.toggleVote(submissionId, interaction.user.id);

    // Ambil data terbaru
    const updatedSubmission = client.db.fanArt.get(submissionId);
    const newVoteCount = updatedSubmission.votes;

    // Update tombol vote dengan jumlah terbaru
    const updatedBtn = new ButtonBuilder()
      .setCustomId(`fanart_vote_${submissionId}`)
      .setLabel(`⭐ Vote (${newVoteCount})`)
      .setStyle(ButtonStyle.Secondary);

    const updatedRow = new ActionRowBuilder().addComponents(updatedBtn);

    // Update embed footer dengan jumlah vote terbaru
    const oldEmbed = interaction.message.embeds[0];
    const updatedEmbed = EmbedBuilder.from(oldEmbed)
      .setFooter({ text: `⭐ ${newVoteCount} votes • Submission #${submissionId} • LumigiaBOT` });

    await interaction.editReply({
      embeds: [updatedEmbed],
      components: [updatedRow],
    });

    // Kirim konfirmasi ephemeral via followUp
    await interaction.followUp({
      content: voted
        ? `⭐ Kamu berhasil **vote** fan art #${submissionId}!`
        : `💔 Vote kamu pada fan art #${submissionId} sudah **dicabut**.`,
      ephemeral: true,
    });

    logger.debug(`Fan art #${submissionId} ${voted ? 'voted' : 'unvoted'} by ${interaction.user.tag} — total: ${newVoteCount}`);
  } catch (error) {
    logger.error('fanart_vote button error:', error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ Terjadi error saat memproses vote.',
        ephemeral: true,
      }).catch(() => {});
    }
  }
}
