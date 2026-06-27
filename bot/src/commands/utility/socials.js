/**
 * LumigiaBOT — Perintah /socials
 * Mengelola dan menampilkan profil sosial media server.
 * Subperintah: setup, send, show.
 * Memerlukan izin ManageGuild.
 */

import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 5000;

/**
 * Platform configuration with icons and URL formatters.
 * @type {Record<string, { icon: string, label: string, formatUrl: (value: string) => string }>}
 */
const PLATFORMS = {
  twitch: {
    icon: '🟣',
    label: 'Twitch',
    formatUrl: (v) => (v.startsWith('http') ? v : `https://twitch.tv/${v}`),
  },
  youtube: {
    icon: '🔴',
    label: 'YouTube',
    formatUrl: (v) => (v.startsWith('http') ? v : `https://youtube.com/@${v}`),
  },
  tiktok: {
    icon: '🎵',
    label: 'TikTok',
    formatUrl: (v) => (v.startsWith('http') ? v : `https://tiktok.com/@${v}`),
  },
  twitter: {
    icon: '🐦',
    label: 'Twitter / X',
    formatUrl: (v) => (v.startsWith('http') ? v : `https://x.com/${v}`),
  },
  instagram: {
    icon: '📷',
    label: 'Instagram',
    formatUrl: (v) => (v.startsWith('http') ? v : `https://instagram.com/${v}`),
  },
  website: {
    icon: '🌐',
    label: 'Website',
    formatUrl: (v) => (v.startsWith('http') ? v : `https://${v}`),
  },
};

export const data = new SlashCommandBuilder()
  .setName('socials')
  .setDescription('Manage and display server social media links')
  .addSubcommand((sub) =>
    sub
      .setName('setup')
      .setDescription('Set up social media links for this server')
      .addStringOption((option) =>
        option.setName('twitch').setDescription('Twitch username or URL').setMaxLength(200),
      )
      .addStringOption((option) =>
        option.setName('youtube').setDescription('YouTube username or URL').setMaxLength(200),
      )
      .addStringOption((option) =>
        option.setName('tiktok').setDescription('TikTok username or URL').setMaxLength(200),
      )
      .addStringOption((option) =>
        option.setName('twitter').setDescription('Twitter/X username or URL').setMaxLength(200),
      )
      .addStringOption((option) =>
        option.setName('instagram').setDescription('Instagram username or URL').setMaxLength(200),
      )
      .addStringOption((option) =>
        option.setName('website').setDescription('Website URL').setMaxLength(200),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('send')
      .setDescription('Send the social media embed to a channel')
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('Channel to send to (default: current)')
          .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
      ),
  )
  .addSubcommand((sub) =>
    sub.setName('show').setDescription('Preview current social media links'),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

/**
 * Builds the social media embed for a guild.
 * @param {object} socials - Social links row from the database
 * @param {import('discord.js').Guild} guild - Discord guild object
 * @returns {EmbedBuilder}
 */
function buildSocialsEmbed(socials, guild) {
  const embed = new EmbedBuilder()
    .setTitle(`🔗 ${guild.name} — Social Media Links`)
    .setColor(0x5865F2)
    .setTimestamp()
    .setFooter({ text: 'LumigiaBOT' });

  const iconUrl = guild.iconURL({ size: 512, dynamic: true });
  if (iconUrl) {
    embed.setThumbnail(iconUrl);
  }

  const fields = [];
  for (const [key, config] of Object.entries(PLATFORMS)) {
    const value = socials[key];
    if (value) {
      const url = config.formatUrl(value);
      fields.push({
        name: `${config.icon} ${config.label}`,
        value: `[${value}](${url})`,
        inline: true,
      });
    }
  }

  if (fields.length > 0) {
    embed.addFields(fields);
  } else {
    embed.setDescription('*No social links configured yet.*');
  }

  return embed;
}

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const subcommand = interaction.options.getSubcommand();
  const guildId = interaction.guildId;

  try {
    switch (subcommand) {
      // ── Setup Socials ──
      case 'setup': {
        const twitch = interaction.options.getString('twitch');
        const youtube = interaction.options.getString('youtube');
        const tiktok = interaction.options.getString('tiktok');
        const twitter = interaction.options.getString('twitter');
        const instagram = interaction.options.getString('instagram');
        const website = interaction.options.getString('website');

        // Check that at least one platform is provided
        if (!twitch && !youtube && !tiktok && !twitter && !instagram && !website) {
          await interaction.reply({
            embeds: [errorEmbed('❌ Please provide at least one social media link.')],
            ephemeral: true,
          });
          return;
        }

        // Merge with existing data so users can update incrementally
        const existing = client.db.customEmbeds.getSocials(guildId) ?? {};
        const merged = {
          twitch: twitch ?? existing.twitch ?? null,
          youtube: youtube ?? existing.youtube ?? null,
          tiktok: tiktok ?? existing.tiktok ?? null,
          twitter: twitter ?? existing.twitter ?? null,
          instagram: instagram ?? existing.instagram ?? null,
          website: website ?? existing.website ?? null,
        };

        client.db.customEmbeds.setSocials(guildId, merged);

        // Build preview embed
        const previewEmbed = buildSocialsEmbed(merged, interaction.guild);

        await interaction.reply({
          content: '✅ Social media links have been saved! Here\'s a preview:',
          embeds: [previewEmbed],
          ephemeral: true,
        });

        logger.info(`Socials updated by ${interaction.user.tag} in guild ${guildId}`);
        break;
      }

      // ── Send Socials Embed ──
      case 'send': {
        const channel = interaction.options.getChannel('channel') ?? interaction.channel;

        const socials = client.db.customEmbeds.getSocials(guildId);
        if (!socials) {
          await interaction.reply({
            embeds: [errorEmbed('❌ No social links configured yet. Use `/socials setup` first.')],
            ephemeral: true,
          });
          return;
        }

        const socialsEmbed = buildSocialsEmbed(socials, interaction.guild);
        await channel.send({ embeds: [socialsEmbed] });

        await interaction.reply({
          embeds: [successEmbed(`✅ Social media embed sent to ${channel}.`)],
          ephemeral: true,
        });

        logger.info(`Socials embed sent by ${interaction.user.tag} to #${channel.name}`);
        break;
      }

      // ── Show Current Socials ──
      case 'show': {
        const socials = client.db.customEmbeds.getSocials(guildId);
        if (!socials) {
          await interaction.reply({
            embeds: [createEmbed('info').setTitle('🔗 Social Media Links').setDescription('No social links configured yet.\nUse `/socials setup` to get started!')],
            ephemeral: true,
          });
          return;
        }

        const showEmbed = buildSocialsEmbed(socials, interaction.guild);
        await interaction.reply({ embeds: [showEmbed], ephemeral: true });
        break;
      }
    }
  } catch (error) {
    logger.error('socials command error:', error);
    await interaction.reply({
      embeds: [errorEmbed('❌ An unexpected error occurred. Please try again later.')],
      ephemeral: true,
    }).catch(() => {});
  }
}
