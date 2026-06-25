/**
 * LumigiaBOT — Menu Pilihan Toggle AutoMod
 * Memungkinkan moderator untuk mengaktifkan/menonaktifkan filter automod melalui menu pilihan.
 */

import { t } from '../../i18n/helpers.js';
import { createEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';

/** @type {string} */
export const customId = 'automod_toggle';

/**
 * @param {import('discord.js').AnySelectMenuInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    // Memerlukan izin ManageGuild
    if (!interaction.member.permissions.has('ManageGuild')) {
      const msg = t(client, interaction.guildId, 'errors.no_permission');
      return interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
    }

    const selectedFilters = interaction.values;
    const results = [];

    for (const filterName of selectedFilters) {
      // Ambil status saat ini
      const current = client.db.automod.getFilter(interaction.guildId, filterName);
      const newEnabled = !(current?.enabled);

      // Toggle filter (pertahankan aksi yang ada atau default ke 'delete')
      client.db.automod.setFilter(
        interaction.guildId,
        filterName,
        newEnabled,
        current?.action ?? 'delete',
        current?.config ?? '{}',
      );

      const statusEmoji = newEnabled ? '✅' : '❌';
      results.push(`${statusEmoji} **${filterName}** — ${newEnabled ? 'Enabled' : 'Disabled'}`);
    }

    const embed = createEmbed('automod')
      .setTitle('🛡️ AutoMod Filters Updated')
      .setDescription(results.join('\n'));

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    logger.error('AutoMod toggle select menu error:', error);
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
  }
}
