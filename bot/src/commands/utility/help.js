/**
 * LumigiaBOT — Perintah /help
 * Menampilkan daftar semua perintah yang dikelompokkan berdasarkan kategori beserta deskripsinya.
 */

import { SlashCommandBuilder } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { createEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 5000;

/** Nama tampilan dan emoji kategori */
const CATEGORY_META = {
  admin: { emoji: '⚙️', label: 'Admin' },
  moderation: { emoji: '🛡️', label: 'Moderation' },
  tickets: { emoji: '📩', label: 'Tickets' },
  utility: { emoji: '🔧', label: 'Utility' },
  automod: { emoji: '🤖', label: 'AutoMod' },
};

export const data = new SlashCommandBuilder()
  .setName('help')
  .setDescription('List all available commands');

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    // Mengelompokkan perintah berdasarkan kategori
    const groups = new Map();

    for (const [, command] of client.commands) {
      const category = command.category || 'other';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category).push(command);
    }

    // Membuat embed
    const embed = createEmbed('info')
      .setTitle(t(client, interaction.guildId, 'commands.help.title'))
      .setDescription(t(client, interaction.guildId, 'commands.help.description'));

    // Mengurutkan kategori agar urutan konsisten
    const sortedCategories = [...groups.entries()].sort((a, b) =>
      a[0].localeCompare(b[0]),
    );

    for (const [category, commands] of sortedCategories) {
      const meta = CATEGORY_META[category] || { emoji: '📁', label: category };

      // Memformat daftar perintah
      const commandList = commands
        .sort((a, b) => a.data.name.localeCompare(b.data.name))
        .map((cmd) => `\`/${cmd.data.name}\` — ${cmd.data.description}`)
        .join('\n');

      embed.addFields({
        name: `${meta.emoji} ${meta.label}`,
        value: commandList || '*No commands*',
      });
    }

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('help command error:', error);
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
  }
}
