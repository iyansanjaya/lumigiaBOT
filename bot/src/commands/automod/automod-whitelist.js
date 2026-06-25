/**
 * LumigiaBOT — Perintah /automod-whitelist
 * Menambah atau menghapus role/channel dari daftar putih automod.
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { Cooldowns } from '../../config/constants.js';

/** @type {number} */
export const cooldown = Cooldowns.ADMIN;

export const data = new SlashCommandBuilder()
  .setName('automod-whitelist')
  .setDescription('Manage the automod whitelist')
  .addSubcommand((sub) =>
    sub
      .setName('add')
      .setDescription('Add a role or channel to the whitelist')
      .addStringOption((opt) =>
        opt
          .setName('type')
          .setDescription('Whitelist type')
          .setRequired(true)
          .addChoices(
            { name: 'Role', value: 'role' },
            { name: 'Channel', value: 'channel' },
          ),
      )
      .addStringOption((opt) =>
        opt.setName('target').setDescription('Role or Channel ID / mention').setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('remove')
      .setDescription('Remove a role or channel from the whitelist')
      .addStringOption((opt) =>
        opt
          .setName('type')
          .setDescription('Whitelist type')
          .setRequired(true)
          .addChoices(
            { name: 'Role', value: 'role' },
            { name: 'Channel', value: 'channel' },
          ),
      )
      .addStringOption((opt) =>
        opt.setName('target').setDescription('Role or Channel ID / mention').setRequired(true),
      ),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

/**
 * Mengekstrak ID snowflake dari string mention atau ID mentah.
 * @param {string} input - contoh: "<@&123456>" atau "<#123456>" atau "123456"
 * @returns {string}
 */
function extractId(input) {
  const match = input.match(/\d+/);
  return match ? match[0] : input;
}

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const subcommand = interaction.options.getSubcommand();
  const type = interaction.options.getString('type');
  const rawTarget = interaction.options.getString('target');
  const targetId = extractId(rawTarget);

  try {
    if (subcommand === 'add') {
      client.db.automod.addWhitelist(interaction.guildId, type, targetId);

      const msg = t(client, interaction.guildId, 'automod.whitelisted', {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        target: rawTarget,
      });
      await interaction.reply({ embeds: [successEmbed(msg)] });
    } else {
      const removed = client.db.automod.removeWhitelist(interaction.guildId, type, targetId);

      if (!removed) {
        return interaction.reply({
          embeds: [errorEmbed('❌ That entry was not found in the whitelist.')],
          ephemeral: true,
        });
      }

      const msg = t(client, interaction.guildId, 'automod.removed_whitelist', {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        target: rawTarget,
      });
      await interaction.reply({ embeds: [successEmbed(msg)] });
    }
  } catch (error) {
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
  }
}
