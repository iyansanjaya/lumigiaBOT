/**
 * LumigiaBOT — Perintah /automod-config
 * Mengonfigurasi filter automod: aktifkan/nonaktifkan dan atur tindakan.
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { createEmbed, successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { Cooldowns } from '../../config/constants.js';

/** @type {number} */
export const cooldown = Cooldowns.ADMIN;

/** Nama-nama filter yang tersedia */
const FILTER_CHOICES = [
  { name: 'Spam', value: 'spam' },
  { name: 'Link', value: 'link' },
  { name: 'Word', value: 'word' },
  { name: 'Caps', value: 'caps' },
  { name: 'Emoji', value: 'emoji' },
  { name: 'Mention', value: 'mention' },
];

/** Tindakan yang tersedia */
const ACTION_CHOICES = [
  { name: 'Delete Message', value: 'delete' },
  { name: 'Warn User', value: 'warn' },
  { name: 'Mute User', value: 'mute' },
  { name: 'Kick User', value: 'kick' },
  { name: 'Ban User', value: 'ban' },
];

export const data = new SlashCommandBuilder()
  .setName('automod-config')
  .setDescription('Configure automod filters')
  .addStringOption((opt) =>
    opt
      .setName('filter')
      .setDescription('The filter to configure')
      .setRequired(true)
      .addChoices(...FILTER_CHOICES),
  )
  .addBooleanOption((opt) =>
    opt.setName('enabled').setDescription('Enable or disable the filter').setRequired(true),
  )
  .addStringOption((opt) =>
    opt
      .setName('action')
      .setDescription('Action to take when triggered')
      .setRequired(true)
      .addChoices(...ACTION_CHOICES),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const filterName = interaction.options.getString('filter');
  const enabled = interaction.options.getBoolean('enabled');
  const action = interaction.options.getString('action');

  try {
    // Memperbarui konfigurasi filter di database
    client.db.automod.setFilter(interaction.guildId, filterName, enabled, action);

    const statusEmoji = enabled ? '✅' : '❌';
    const statusText = enabled ? 'Enabled' : 'Disabled';

    const embed = createEmbed('automod')
      .setTitle('🛡️ AutoMod Configuration Updated')
      .addFields(
        { name: 'Filter', value: filterName, inline: true },
        { name: 'Status', value: `${statusEmoji} ${statusText}`, inline: true },
        { name: 'Action', value: action, inline: true },
      );

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
  }
}
