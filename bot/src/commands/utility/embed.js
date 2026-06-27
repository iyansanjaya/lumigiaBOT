/**
 * LumigiaBOT — Perintah /embed
 * Membuat, mengedit, menghapus, dan menampilkan daftar custom embed.
 * Subperintah: create, edit, delete, list.
 * Memerlukan izin ManageGuild.
 */

import { SlashCommandBuilder, PermissionFlagsBits, ChannelType, EmbedBuilder } from 'discord.js';
import { createEmbed, successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 5000;

export const data = new SlashCommandBuilder()
  .setName('embed')
  .setDescription('Create and manage custom embeds')
  .addSubcommand((sub) =>
    sub
      .setName('create')
      .setDescription('Create a new custom embed and send it to a channel')
      .addStringOption((option) =>
        option
          .setName('name')
          .setDescription('Unique name for this embed')
          .setRequired(true)
          .setMaxLength(64),
      )
      .addStringOption((option) =>
        option
          .setName('title')
          .setDescription('Embed title')
          .setRequired(true)
          .setMaxLength(256),
      )
      .addStringOption((option) =>
        option
          .setName('description')
          .setDescription('Embed description')
          .setMaxLength(4096),
      )
      .addStringOption((option) =>
        option
          .setName('color')
          .setDescription('Hex color code (default: #5865F2)')
          .setMaxLength(7),
      )
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('Channel to send the embed to (default: current)')
          .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('edit')
      .setDescription('Edit an existing custom embed')
      .addStringOption((option) =>
        option
          .setName('name')
          .setDescription('Name of the embed to edit')
          .setRequired(true)
          .setMaxLength(64),
      )
      .addStringOption((option) =>
        option
          .setName('title')
          .setDescription('New embed title')
          .setMaxLength(256),
      )
      .addStringOption((option) =>
        option
          .setName('description')
          .setDescription('New embed description')
          .setMaxLength(4096),
      )
      .addStringOption((option) =>
        option
          .setName('color')
          .setDescription('New hex color code')
          .setMaxLength(7),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('delete')
      .setDescription('Delete a custom embed')
      .addStringOption((option) =>
        option
          .setName('name')
          .setDescription('Name of the embed to delete')
          .setRequired(true)
          .setMaxLength(64),
      ),
  )
  .addSubcommand((sub) =>
    sub.setName('list').setDescription('List all custom embeds in this server'),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

/**
 * Resolves a hex color string to an integer value.
 * @param {string} hex - Hex color string (e.g. '#5865F2')
 * @returns {number|null} Parsed integer color or null if invalid
 */
function parseHexColor(hex) {
  const cleaned = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  return parseInt(cleaned, 16);
}

/**
 * Builds a Discord EmbedBuilder from stored embed data.
 * @param {object} embedData - Stored embed data object
 * @returns {EmbedBuilder}
 */
function buildDiscordEmbed(embedData) {
  const embed = new EmbedBuilder()
    .setTitle(embedData.title)
    .setColor(embedData.color ?? 0x5865F2)
    .setTimestamp()
    .setFooter({ text: 'LumigiaBOT' });

  if (embedData.description) {
    embed.setDescription(embedData.description);
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
      // ── Create Embed ──
      case 'create': {
        const name = interaction.options.getString('name').toLowerCase();
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');
        const colorStr = interaction.options.getString('color') ?? '#5865F2';
        const channel = interaction.options.getChannel('channel') ?? interaction.channel;

        // Check if name already exists
        const existing = client.db.customEmbeds.getEmbedByName(guildId, name);
        if (existing) {
          await interaction.reply({
            embeds: [errorEmbed(`❌ An embed with the name **\`${name}\`** already exists. Use \`/embed edit\` to modify it.`)],
            ephemeral: true,
          });
          return;
        }

        // Parse color
        const color = parseHexColor(colorStr);
        if (color === null) {
          await interaction.reply({
            embeds: [errorEmbed('❌ Invalid color format. Please use a hex code like `#5865F2`.')],
            ephemeral: true,
          });
          return;
        }

        // Build embed data
        const embedData = { title, description: description || null, color };

        // Save to DB
        const embedId = client.db.customEmbeds.createEmbed(guildId, name, embedData);

        // Build and send the Discord embed
        const discordEmbed = buildDiscordEmbed(embedData);
        const sentMessage = await channel.send({ embeds: [discordEmbed] });

        // Save message and channel reference
        client.db.customEmbeds.setEmbedMessage(embedId, channel.id, sentMessage.id);

        await interaction.reply({
          embeds: [successEmbed(`✅ Embed **\`${name}\`** created and sent to ${channel}.`)],
          ephemeral: true,
        });

        logger.info(`Embed "${name}" created by ${interaction.user.tag} in guild ${guildId}`);
        break;
      }

      // ── Edit Embed ──
      case 'edit': {
        const name = interaction.options.getString('name').toLowerCase();
        const newTitle = interaction.options.getString('title');
        const newDescription = interaction.options.getString('description');
        const newColorStr = interaction.options.getString('color');

        // Find existing embed
        const embed = client.db.customEmbeds.getEmbedByName(guildId, name);
        if (!embed) {
          await interaction.reply({
            embeds: [errorEmbed(`❌ No embed found with the name **\`${name}\`**.`)],
            ephemeral: true,
          });
          return;
        }

        // Check that at least one field is being changed
        if (!newTitle && !newDescription && !newColorStr) {
          await interaction.reply({
            embeds: [errorEmbed('❌ Please provide at least one field to update (title, description, or color).')],
            ephemeral: true,
          });
          return;
        }

        // Update embed data
        const embedData = { ...embed.embed_data };
        if (newTitle) embedData.title = newTitle;
        if (newDescription) embedData.description = newDescription;
        if (newColorStr) {
          const color = parseHexColor(newColorStr);
          if (color === null) {
            await interaction.reply({
              embeds: [errorEmbed('❌ Invalid color format. Please use a hex code like `#5865F2`.')],
              ephemeral: true,
            });
            return;
          }
          embedData.color = color;
        }

        // Save updated data
        client.db.customEmbeds.updateEmbed(embed.id, embedData);

        // Try to edit the original message if it still exists
        if (embed.channel_id && embed.message_id) {
          try {
            const channel = await interaction.guild.channels.fetch(embed.channel_id);
            if (channel) {
              const message = await channel.messages.fetch(embed.message_id);
              if (message) {
                const updatedDiscordEmbed = buildDiscordEmbed(embedData);
                await message.edit({ embeds: [updatedDiscordEmbed] });
              }
            }
          } catch {
            // Message or channel no longer exists — continue silently
          }
        }

        await interaction.reply({
          embeds: [successEmbed(`✅ Embed **\`${name}\`** has been updated.`)],
          ephemeral: true,
        });

        logger.info(`Embed "${name}" edited by ${interaction.user.tag} in guild ${guildId}`);
        break;
      }

      // ── Delete Embed ──
      case 'delete': {
        const name = interaction.options.getString('name').toLowerCase();

        // Find existing embed
        const embed = client.db.customEmbeds.getEmbedByName(guildId, name);
        if (!embed) {
          await interaction.reply({
            embeds: [errorEmbed(`❌ No embed found with the name **\`${name}\`**.`)],
            ephemeral: true,
          });
          return;
        }

        // Try to delete the original message
        if (embed.channel_id && embed.message_id) {
          try {
            const channel = await interaction.guild.channels.fetch(embed.channel_id);
            if (channel) {
              const message = await channel.messages.fetch(embed.message_id);
              if (message) await message.delete();
            }
          } catch {
            // Message or channel no longer exists — continue silently
          }
        }

        // Delete from DB
        client.db.customEmbeds.deleteEmbedByName(guildId, name);

        await interaction.reply({
          embeds: [successEmbed(`✅ Embed **\`${name}\`** has been deleted.`)],
          ephemeral: true,
        });

        logger.info(`Embed "${name}" deleted by ${interaction.user.tag} in guild ${guildId}`);
        break;
      }

      // ── List Embeds ──
      case 'list': {
        const embeds = client.db.customEmbeds.getEmbedsByGuild(guildId);

        if (embeds.length === 0) {
          await interaction.reply({
            embeds: [createEmbed('info').setTitle('📋 Custom Embeds').setDescription('No custom embeds have been created yet.\nUse `/embed create` to get started!')],
            ephemeral: true,
          });
          return;
        }

        const listEmbed = createEmbed('info').setTitle(`📋 Custom Embeds (${embeds.length})`);

        const lines = embeds.map((e) => {
          const channelRef = e.channel_id ? `<#${e.channel_id}>` : '*Not sent*';
          const title = e.embed_data.title ?? '*No title*';
          return `**\`${e.name}\`** — ${title}\n↳ Channel: ${channelRef}`;
        });

        listEmbed.setDescription(lines.join('\n\n'));

        await interaction.reply({ embeds: [listEmbed], ephemeral: true });
        break;
      }
    }
  } catch (error) {
    logger.error('embed command error:', error);
    await interaction.reply({
      embeds: [errorEmbed('❌ An unexpected error occurred. Please try again later.')],
      ephemeral: true,
    }).catch(() => {});
  }
}
