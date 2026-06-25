/**
 * LumigiaBOT — Perintah /automod-logs
 * Mengatur channel tempat log pelanggaran automod dikirim.
 */

import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { Cooldowns } from '../../config/constants.js';

/** @type {number} */
export const cooldown = Cooldowns.ADMIN;

export const data = new SlashCommandBuilder()
  .setName('automod-logs')
  .setDescription('Set the automod log channel')
  .addChannelOption((opt) =>
    opt
      .setName('channel')
      .setDescription('Channel to send automod logs to')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const channel = interaction.options.getChannel('channel');

  try {
    client.db.guildSettings.set(interaction.guildId, 'automod_log_channel', channel.id);

    await interaction.reply({
      embeds: [successEmbed(`✅ AutoMod logs will be sent to ${channel}.`)],
    });
  } catch (error) {
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
  }
}
