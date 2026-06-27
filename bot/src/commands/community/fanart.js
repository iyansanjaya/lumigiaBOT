/**
 * LumigiaBOT — Perintah /fanart
 * Mengelola sistem fan art gallery: submit, setup, gallery, pending.
 */

import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ChannelType,
  EmbedBuilder,
} from 'discord.js';
import { successEmbed, errorEmbed, createEmbed } from '../../utils/EmbedBuilder.js';
import FanArtService from '../../modules/fanart/FanArtService.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 5000;

/** Warna embed fan art */
const COLORS = {
  FANART: 0xE91E63,
  SUCCESS: 0x43B581,
  ERROR: 0xF04747,
};

/** Batas submission per user */
const MAX_SUBMISSIONS = 10;

/** Items per page untuk gallery pagination */
const ITEMS_PER_PAGE = 5;

export const data = new SlashCommandBuilder()
  .setName('fanart')
  .setDescription('Fan Art Gallery system')

  // --- submit ---
  .addSubcommand((sub) =>
    sub
      .setName('submit')
      .setDescription('Submit your fan art to the gallery')
      .addAttachmentOption((opt) =>
        opt
          .setName('image')
          .setDescription('Your fan art image')
          .setRequired(true),
      )
      .addStringOption((opt) =>
        opt
          .setName('title')
          .setDescription('Title of your artwork')
          .setRequired(false)
          .setMaxLength(100),
      )
      .addStringOption((opt) =>
        opt
          .setName('description')
          .setDescription('Description of your artwork')
          .setRequired(false)
          .setMaxLength(500),
      ),
  )

  // --- setup ---
  .addSubcommand((sub) =>
    sub
      .setName('setup')
      .setDescription('Configure the fan art gallery')
      .addChannelOption((opt) =>
        opt
          .setName('submit-channel')
          .setDescription('Channel for submission review')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true),
      )
      .addChannelOption((opt) =>
        opt
          .setName('gallery-channel')
          .setDescription('Channel to showcase approved fan art')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true),
      )
      .addBooleanOption((opt) =>
        opt
          .setName('approval')
          .setDescription('Require approval before posting to gallery (default: true)')
          .setRequired(false),
      ),
  )

  // --- gallery ---
  .addSubcommand((sub) =>
    sub
      .setName('gallery')
      .setDescription('Browse top fan art by votes')
      .addIntegerOption((opt) =>
        opt
          .setName('page')
          .setDescription('Page number (default: 1)')
          .setRequired(false)
          .setMinValue(1),
      ),
  )

  // --- pending ---
  .addSubcommand((sub) =>
    sub.setName('pending').setDescription('View pending fan art submissions'),
  );

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const subcommand = interaction.options.getSubcommand();

  try {
    switch (subcommand) {
      case 'submit':
        await handleSubmit(interaction, client);
        break;
      case 'setup':
        await handleSetup(interaction, client);
        break;
      case 'gallery':
        await handleGallery(interaction, client);
        break;
      case 'pending':
        await handlePending(interaction, client);
        break;
    }

    logger.info(`fanart ${subcommand} executed by ${interaction.user.tag}`);
  } catch (error) {
    logger.error(`fanart ${subcommand} error:`, error);

    const payload = { embeds: [errorEmbed('❌ An unexpected error occurred.')], ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
}

// ─── Subcommand Handlers ──────────────────────────────────────

/**
 * Submit fan art baru.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleSubmit(interaction, client) {
  const settings = client.db.fanArt.getSettings(interaction.guildId);

  // Cek apakah fan art sudah di-setup
  if (!settings || !settings.gallery_channel) {
    return interaction.reply({
      embeds: [errorEmbed('❌ Fan art gallery has not been set up yet. Ask an admin to run `/fanart setup`.')],
      ephemeral: true,
    });
  }

  // Validasi file adalah gambar
  const attachment = interaction.options.getAttachment('image');
  if (!attachment.contentType || !attachment.contentType.startsWith('image/')) {
    return interaction.reply({
      embeds: [errorEmbed('❌ Please upload a valid image file (PNG, JPG, GIF, WEBP).')],
      ephemeral: true,
    });
  }

  // Cek batas submission per user
  const count = client.db.fanArt.countByUser(interaction.guildId, interaction.user.id);
  if (count >= MAX_SUBMISSIONS) {
    return interaction.reply({
      embeds: [errorEmbed(`❌ You have reached the maximum of **${MAX_SUBMISSIONS}** submissions. Wait for some to be reviewed or removed.`)],
      ephemeral: true,
    });
  }

  await interaction.deferReply({ ephemeral: true });

  const title = interaction.options.getString('title');
  const description = interaction.options.getString('description');

  const submission = await FanArtService.submitArt(
    client,
    interaction,
    attachment.url,
    title,
    description,
  );

  const isAutoApproved = !settings.approval_required;

  await interaction.editReply({
    embeds: [
      successEmbed(
        `🎨 Fan art submitted successfully!\n\n` +
        `**ID:** #${submission.id}\n` +
        (submission.title ? `**Title:** ${submission.title}\n` : '') +
        (isAutoApproved
          ? '✅ Your art has been posted to the gallery!'
          : '⏳ Your submission is pending review by a moderator.'),
      ),
    ],
  });
}

/**
 * Setup fan art gallery.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleSetup(interaction, client) {
  // Cek izin ManageGuild
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({
      embeds: [errorEmbed('❌ You need **Manage Server** permission to use this command.')],
      ephemeral: true,
    });
  }

  const submitChannel = interaction.options.getChannel('submit-channel');
  const galleryChannel = interaction.options.getChannel('gallery-channel');
  const approvalRequired = interaction.options.getBoolean('approval') ?? true;

  client.db.fanArt.setSettings(interaction.guildId, {
    enabled: true,
    submitChannel: submitChannel.id,
    galleryChannel: galleryChannel.id,
    approvalRequired,
    voteEmoji: '⭐',
  });

  await interaction.reply({
    embeds: [
      successEmbed(
        `🎨 Fan Art Gallery configured!\n\n` +
        `**Submit Channel:** ${submitChannel}\n` +
        `**Gallery Channel:** ${galleryChannel}\n` +
        `**Approval Required:** ${approvalRequired ? 'Yes ✅' : 'No — auto-post ⚡'}`,
      ),
    ],
    ephemeral: true,
  });
}

/**
 * Tampilkan gallery fan art dengan pagination.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handleGallery(interaction, client) {
  const gallery = client.db.fanArt.getGallery(interaction.guildId, 50);

  if (gallery.length === 0) {
    return interaction.reply({
      embeds: [errorEmbed('🖼️ No approved fan art in the gallery yet.')],
      ephemeral: true,
    });
  }

  const page = (interaction.options.getInteger('page') ?? 1) - 1;
  const totalPages = Math.ceil(gallery.length / ITEMS_PER_PAGE);
  const currentPage = Math.min(page, totalPages - 1);
  const start = currentPage * ITEMS_PER_PAGE;
  const pageItems = gallery.slice(start, start + ITEMS_PER_PAGE);

  const embed = new EmbedBuilder()
    .setTitle('🖼️ Fan Art Gallery — Top by Votes')
    .setColor(COLORS.FANART)
    .setTimestamp()
    .setFooter({ text: `Page ${currentPage + 1}/${totalPages} • LumigiaBOT` });

  const lines = [];

  for (let i = 0; i < pageItems.length; i++) {
    const item = pageItems[i];
    const rank = start + i + 1;
    const title = item.title || 'Untitled';
    lines.push(
      `**${rank}.** ${title} — by <@${item.user_id}>` +
      `\n> ⭐ ${item.votes} votes • Submitted <t:${Math.floor(new Date(item.created_at).getTime() / 1000)}:R>`,
    );
  }

  embed.setDescription(lines.join('\n\n'));

  // Menampilkan gambar teratas di halaman ini sebagai thumbnail
  if (pageItems.length > 0) {
    embed.setThumbnail(pageItems[0].image_url);
  }

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

/**
 * Tampilkan daftar submission yang pending review.
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
async function handlePending(interaction, client) {
  // Cek izin ManageGuild
  if (!interaction.memberPermissions.has(PermissionFlagsBits.ManageGuild)) {
    return interaction.reply({
      embeds: [errorEmbed('❌ You need **Manage Server** permission to use this command.')],
      ephemeral: true,
    });
  }

  const pending = client.db.fanArt.getPending(interaction.guildId);

  if (pending.length === 0) {
    return interaction.reply({
      embeds: [successEmbed('✅ No pending fan art submissions. All caught up!')],
      ephemeral: true,
    });
  }

  const embed = new EmbedBuilder()
    .setTitle('⏳ Pending Fan Art Submissions')
    .setColor(COLORS.FANART)
    .setTimestamp()
    .setFooter({ text: `${pending.length} pending • LumigiaBOT` });

  const lines = pending.slice(0, 15).map((item) => {
    const title = item.title || 'Untitled';
    const submittedAt = Math.floor(new Date(item.created_at).getTime() / 1000);
    return (
      `**#${item.id}** — ${title}\n` +
      `> 👤 <@${item.user_id}> • Submitted <t:${submittedAt}:R>`
    );
  });

  if (pending.length > 15) {
    lines.push(`\n*...and ${pending.length - 15} more*`);
  }

  embed.setDescription(lines.join('\n\n'));

  await interaction.reply({ embeds: [embed], ephemeral: true });
}
