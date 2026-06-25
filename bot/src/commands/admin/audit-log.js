/**
 * LumigiaBOT — Perintah /audit-log
 * Melihat dan mencari entri log audit moderasi.
 * Subperintah: view, search.
 * Memerlukan izin ManageGuild.
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { createEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { discordTimestamp } from '../../utils/TimeFormatter.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 5000;

export const data = new SlashCommandBuilder()
  .setName('audit-log')
  .setDescription('View moderation audit logs')
  .addSubcommand((sub) =>
    sub.setName('view').setDescription('View the 10 most recent audit log entries'),
  )
  .addSubcommand((sub) =>
    sub
      .setName('search')
      .setDescription('Search audit logs by user')
      .addUserOption((option) =>
        option.setName('user').setDescription('User to search for').setRequired(true),
      ),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

/**
 * Memformat entri log audit menjadi string yang mudah dibaca.
 * @param {object[]} entries
 * @returns {string}
 */
function formatEntries(entries) {
  if (!entries || entries.length === 0) {
    return '*No entries found.*';
  }

  return entries
    .map((entry) => {
      const timestamp = discordTimestamp(new Date(entry.created_at + 'Z'));
      const target = entry.target_id ? `<@${entry.target_id}>` : 'N/A';
      const moderator = `<@${entry.moderator_id}>`;
      const reason = entry.reason || 'No reason';

      return [
        `**${entry.action}** ${timestamp}`,
        `┗ Mod: ${moderator} → Target: ${target}`,
        `┗ ${reason}`,
      ].join('\n');
    })
    .join('\n\n');
}

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const subcommand = interaction.options.getSubcommand();

  try {
    switch (subcommand) {
      // --- Lihat Entri Terbaru ---
      case 'view': {
        const entries = client.db.auditLogs.getRecent(interaction.guildId, 10);
        const totalCount = client.db.auditLogs.count(interaction.guildId);

        const embed = createEmbed('moderation')
          .setTitle('📋 Audit Log — Recent Actions')
          .setDescription(formatEntries(entries))
          .setFooter({ text: `Total entries: ${totalCount} | LumigiaBOT` });

        await interaction.reply({ embeds: [embed] });
        break;
      }

      // --- Cari berdasarkan Pengguna ---
      case 'search': {
        const user = interaction.options.getUser('user');
        const entries = client.db.auditLogs.getByUser(interaction.guildId, user.id, 10);

        const embed = createEmbed('moderation')
          .setTitle(`📋 Audit Log — ${user.tag}`)
          .setDescription(formatEntries(entries))
          .setThumbnail(user.displayAvatarURL({ size: 64 }));

        await interaction.reply({ embeds: [embed] });
        break;
      }
    }
  } catch (error) {
    logger.error('audit-log command error:', error);
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
  }
}
