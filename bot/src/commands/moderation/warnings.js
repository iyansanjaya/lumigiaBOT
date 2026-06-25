/**
 * LumigiaBOT — Perintah /warnings
 * Menampilkan semua peringatan untuk pengguna dalam embed berpaginasi.
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { createEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { Cooldowns } from '../../config/constants.js';

/** @type {number} */
export const cooldown = Cooldowns.MODERATION;

export const data = new SlashCommandBuilder()
  .setName('warnings')
  .setDescription('View all warnings for a user')
  .addUserOption((opt) =>
    opt.setName('user').setDescription('The user to check').setRequired(true),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const user = interaction.options.getUser('user');

  try {
    const warnings = client.db.warnings.getByUser(interaction.guildId, user.id);

    const embed = createEmbed('warning').setTitle(
      t(client, interaction.guildId, 'commands.warnings.title', { user: user.tag }),
    );

    if (!warnings || warnings.length === 0) {
      embed.setDescription(
        t(client, interaction.guildId, 'commands.warnings.no_warnings'),
      );
      return interaction.reply({ embeds: [embed] });
    }

    // Membuat entri peringatan (tampilkan hingga 10 per halaman)
    const entries = warnings.slice(0, 10).map((w) => {
      const date = new Date(w.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });

      return t(client, interaction.guildId, 'commands.warnings.entry', {
        id: w.id,
        moderator: `<@${w.moderator_id}>`,
        date,
        reason: w.reason,
      });
    });

    embed.setDescription(entries.join('\n\n'));

    if (warnings.length > 10) {
      embed.setFooter({
        text: `Showing 10 of ${warnings.length} warnings • LumigiaBOT`,
      });
    }

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
  }
}
