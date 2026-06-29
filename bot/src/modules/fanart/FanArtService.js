/**
 * LumigiaBOT — Fan Art Gallery Service
 * Mengelola logika inti fan art: submission, approval, rejection, embed & gallery.
 */

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { logger } from '../../utils/Logger.js';

/** Warna embed fan art */
const COLORS = {
  FANART: 0xE91E63,
  SUCCESS: 0x43B581,
  ERROR: 0xF04747,
};

export default class FanArtService {
  /**
   * Bangun embed submission fan art untuk review channel.
   * Menampilkan gambar, author, title, deskripsi + tombol Approve/Reject.
   * @param {object} submission - Objek submission dari database
   * @param {import('discord.js').User} user - User yang mengirim fan art
   * @returns {{ embed: EmbedBuilder, row: ActionRowBuilder }}
   */
  static buildSubmissionEmbed(submission, user) {
    const embed = new EmbedBuilder()
      .setTitle(`🎨 Fan Art Submission${submission.title ? `: ${submission.title}` : ''}`)
      .setColor(COLORS.FANART)
      .setImage(submission.image_url)
      .setTimestamp()
      .setFooter({ text: `Submission #${submission.id} • LumigiaBOT` });

    const lines = [
      `**Artist:** ${user} (${user.tag})`,
    ];

    if (submission.description) {
      lines.push('', `> ${submission.description}`);
    }

    lines.push('', '⏳ **Status:** Pending Review');

    embed.setDescription(lines.join('\n'));
    embed.setThumbnail(user.displayAvatarURL({ size: 64 }));

    // Tombol Approve / Reject
    const approveBtn = new ButtonBuilder()
      .setCustomId(`fanart_approve_${submission.id}`)
      .setLabel('Approve')
      .setEmoji('✅')
      .setStyle(ButtonStyle.Success);

    const rejectBtn = new ButtonBuilder()
      .setCustomId(`fanart_reject_${submission.id}`)
      .setLabel('Reject')
      .setEmoji('❌')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(approveBtn, rejectBtn);

    return { embed, row };
  }

  /**
   * Bangun embed gallery untuk fan art yang sudah di-approve.
   * Menampilkan gambar, credit ke artist, dan jumlah vote.
   * @param {object} submission - Objek submission dari database
   * @param {import('discord.js').User} user - User artist
   * @returns {{ embed: EmbedBuilder, row: ActionRowBuilder }}
   */
  static buildGalleryEmbed(submission, user) {
    const embed = new EmbedBuilder()
      .setTitle(`🖼️ ${submission.title || 'Fan Art'}`)
      .setColor(COLORS.FANART)
      .setImage(submission.image_url)
      .setTimestamp()
      .setFooter({ text: `⭐ ${submission.votes} votes • Submission #${submission.id} • LumigiaBOT` });

    const lines = [
      `**Artist:** ${user} (${user.tag})`,
    ];

    if (submission.description) {
      lines.push('', `> ${submission.description}`);
    }

    embed.setDescription(lines.join('\n'));
    embed.setThumbnail(user.displayAvatarURL({ size: 64 }));

    // Tombol Vote
    const voteBtn = new ButtonBuilder()
      .setCustomId(`fanart_vote_${submission.id}`)
      .setLabel(`⭐ Vote (${submission.votes})`)
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder().addComponents(voteBtn);

    return { embed, row };
  }

  /**
   * Submit fan art baru. Simpan ke DB, kirim ke submit channel jika approval required,
   * atau post langsung ke gallery jika tidak.
   * @param {import('../../core/BotClient.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @param {string} imageUrl - URL gambar fan art
   * @param {string|null} title - Judul fan art
   * @param {string|null} description - Deskripsi fan art
   * @returns {object} Objek submission dari database
   */
  static async submitArt(client, interaction, imageUrl, title, description) {
    const { guildId, user } = interaction;
    const settings = client.db.fanArt.getSettings(guildId);

    // Simpan ke database
    const submissionId = client.db.fanArt.submit(guildId, user.id, imageUrl, title, description);
    const submission = client.db.fanArt.get(submissionId);

    if (settings.approval_required) {
      // Kirim ke submit channel untuk review
      try {
        const submitChannel = await client.channels.fetch(settings.submit_channel);
        if (submitChannel) {
          const { embed, row } = FanArtService.buildSubmissionEmbed(submission, user);
          const message = await submitChannel.send({ embeds: [embed], components: [row] });
          client.db.fanArt.setSubmitMessage(submissionId, message.id);
        }
      } catch (error) {
        logger.error(`Failed to send fan art #${submissionId} to submit channel:`, error);
      }

      logger.info(`Fan art #${submissionId} submitted by ${user.tag} — pending approval`);
    } else {
      // Post langsung ke gallery (tanpa approval)
      client.db.fanArt.approve(submissionId, client.user.id);
      const approvedSubmission = client.db.fanArt.get(submissionId);

      try {
        const galleryChannel = await client.channels.fetch(settings.gallery_channel);
        if (galleryChannel) {
          const { embed: galleryEmbed, row: voteRow } = FanArtService.buildGalleryEmbed(approvedSubmission, user);
          const message = await galleryChannel.send({ embeds: [galleryEmbed], components: [voteRow] });
          client.db.fanArt.setGalleryMessage(submissionId, message.id);
        }
      } catch (error) {
        logger.error(`Failed to post fan art #${submissionId} to gallery:`, error);
      }

      logger.info(`Fan art #${submissionId} submitted by ${user.tag} — auto-approved`);
    }

    return client.db.fanArt.get(submissionId);
  }

  /**
   * Approve fan art. Update status, post ke gallery channel, notify artist via DM.
   * @param {import('../../core/BotClient.js').default} client
   * @param {object} submission - Objek submission dari database
   * @param {string} reviewerId - ID reviewer yang meng-approve
   */
  static async approveArt(client, submission, reviewerId) {
    // Update status di database
    client.db.fanArt.approve(submission.id, reviewerId);
    const approvedSubmission = client.db.fanArt.get(submission.id);

    const settings = client.db.fanArt.getSettings(submission.guild_id);

    // Post ke gallery channel
    try {
      const galleryChannel = await client.channels.fetch(settings.gallery_channel);
      if (galleryChannel) {
        const artist = await client.users.fetch(submission.user_id);
        const { embed: galleryEmbed, row: voteRow } = FanArtService.buildGalleryEmbed(approvedSubmission, artist);
        const message = await galleryChannel.send({ embeds: [galleryEmbed], components: [voteRow] });
        client.db.fanArt.setGalleryMessage(submission.id, message.id);
      }
    } catch (error) {
      logger.error(`Failed to post approved fan art #${submission.id} to gallery:`, error);
    }

    // Notify artist via DM
    try {
      const artist = await client.users.fetch(submission.user_id);
      const dmEmbed = new EmbedBuilder()
        .setTitle('✅ Fan Art Approved!')
        .setColor(COLORS.SUCCESS)
        .setDescription(
          `Your fan art${submission.title ? ` **"${submission.title}"**` : ''} has been approved and posted to the gallery!\n\n` +
          `**Server:** ${(await client.guilds.fetch(submission.guild_id)).name}`,
        )
        .setThumbnail(submission.image_url)
        .setTimestamp()
        .setFooter({ text: 'LumigiaBOT' });

      await artist.send({ embeds: [dmEmbed] });
    } catch (error) {
      // DM mungkin ditutup, abaikan saja
      logger.warn(`Could not DM fan art approval to user ${submission.user_id}:`, error.message);
    }

    logger.info(`Fan art #${submission.id} approved by ${reviewerId}`);
  }

  /**
   * Reject fan art. Update status, notify artist via DM dengan alasan.
   * @param {import('../../core/BotClient.js').default} client
   * @param {object} submission - Objek submission dari database
   * @param {string} reviewerId - ID reviewer yang me-reject
   * @param {string} reason - Alasan penolakan
   */
  static async rejectArt(client, submission, reviewerId, reason) {
    // Update status di database
    client.db.fanArt.reject(submission.id, reviewerId);

    // Notify artist via DM
    try {
      const artist = await client.users.fetch(submission.user_id);
      const dmEmbed = new EmbedBuilder()
        .setTitle('❌ Fan Art Rejected')
        .setColor(COLORS.ERROR)
        .setDescription(
          `Your fan art${submission.title ? ` **"${submission.title}"**` : ''} was not approved.\n\n` +
          `**Reason:** ${reason}\n` +
          `**Server:** ${(await client.guilds.fetch(submission.guild_id)).name}\n\n` +
          `You can submit again after addressing the feedback.`,
        )
        .setThumbnail(submission.image_url)
        .setTimestamp()
        .setFooter({ text: 'LumigiaBOT' });

      await artist.send({ embeds: [dmEmbed] });
    } catch (error) {
      // DM mungkin ditutup, abaikan saja
      logger.warn(`Could not DM fan art rejection to user ${submission.user_id}:`, error.message);
    }

    logger.info(`Fan art #${submission.id} rejected by ${reviewerId} — reason: "${reason}"`);
  }
}
