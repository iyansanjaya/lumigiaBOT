/**
 * LumigiaBOT — Perintah /clearwarns
 * Menghapus semua peringatan atau peringatan tertentu untuk pengguna.
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { Cooldowns } from '../../config/constants.js';

/** @type {number} */
export const cooldown = Cooldowns.MODERATION;

export const data = new SlashCommandBuilder()
  .setName('clearwarns')
  .setDescription('Clear warnings for a user')
  .addUserOption((opt) =>
    opt.setName('user').setDescription('The user to clear warnings for').setRequired(true),
  )
  .addIntegerOption((opt) =>
    opt.setName('id').setDescription('Specific warning ID to remove (clears all if omitted)').setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const user = interaction.options.getUser('user');
  const warningId = interaction.options.getInteger('id');

  try {
    if (warningId) {
      // Menghapus peringatan tertentu
      const removed = client.db.warnings.deleteById(warningId, interaction.guildId);

      if (!removed) {
        return interaction.reply({
          embeds: [errorEmbed(`❌ Warning #${warningId} not found.`)],
          ephemeral: true,
        });
      }

      // Mencatat aksi ke log
      client.db.auditLogs.add(
        interaction.guildId, 'CLEAR_WARN', interaction.user.id, user.id,
        `Removed warning #${warningId}`,
      );

      const msg = t(client, interaction.guildId, 'commands.clearwarns.single', { id: warningId });
      await interaction.reply({ embeds: [successEmbed(msg)] });
    } else {
      // Menghapus semua peringatan untuk pengguna
      const count = client.db.warnings.deleteByUser(interaction.guildId, user.id);

      // Mencatat aksi ke log
      client.db.auditLogs.add(
        interaction.guildId, 'CLEAR_WARNS', interaction.user.id, user.id,
        `Cleared ${count} warning(s)`,
      );

      const msg = t(client, interaction.guildId, 'commands.clearwarns.success', {
        count,
        user: user.tag,
      });
      await interaction.reply({ embeds: [successEmbed(msg)] });
    }
  } catch (error) {
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
  }
}
