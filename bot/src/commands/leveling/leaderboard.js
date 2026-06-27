/**
 * LumigiaBOT — Perintah /leaderboard
 * Menampilkan leaderboard XP server dengan paginasi.
 * Tidak memerlukan izin khusus.
 */

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { LevelingService } from '../../modules/leveling/LevelingService.js';
import { errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';

/** Jumlah entry per halaman */
const PER_PAGE = 10;

/** Warna embed leveling */
const COLORS = {
  INFO: 0x5865F2,
};

export const cooldown = 5000;

export const data = new SlashCommandBuilder()
  .setName('leaderboard')
  .setDescription('View the server XP leaderboard')
  .addIntegerOption((option) =>
    option
      .setName('page')
      .setDescription('Page number (default: 1)')
      .setMinValue(1)
      .setRequired(false),
  );

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    const guildId = interaction.guildId;
    const page = interaction.options.getInteger('page') || 1;

    // Cek apakah leveling aktif
    const settings = client.db.leveling.getSettings(guildId);
    if (!settings || !settings.enabled) {
      return interaction.reply({
        embeds: [errorEmbed('❌ The leveling system is not enabled on this server.')],
        ephemeral: true,
      });
    }

    // Ambil leaderboard — ambil lebih banyak untuk hitung total halaman
    const allEntries = client.db.leveling.getLeaderboard(guildId, 1000);
    if (allEntries.length === 0) {
      return interaction.reply({
        embeds: [errorEmbed('📭 No one has earned XP yet. Start chatting!')],
        ephemeral: true,
      });
    }

    // Hitung pagination
    const totalPages = Math.ceil(allEntries.length / PER_PAGE);
    const currentPage = Math.min(page, totalPages);
    const startIdx = (currentPage - 1) * PER_PAGE;
    const pageEntries = allEntries.slice(startIdx, startIdx + PER_PAGE);

    // Bangun leaderboard list
    const medals = ['🥇', '🥈', '🥉'];
    const lines = pageEntries.map((entry, idx) => {
      const globalRank = startIdx + idx + 1;
      const level = LevelingService.calculateLevel(entry.xp);
      const rankIcon = globalRank <= 3 ? medals[globalRank - 1] : `**#${globalRank}**`;
      return `${rankIcon} <@${entry.user_id}> — Level **${level}** • ${entry.xp.toLocaleString()} XP`;
    });

    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setTitle('🏆 XP Leaderboard')
      .setDescription(lines.join('\n'))
      .setTimestamp()
      .setFooter({ text: `Page ${currentPage} of ${totalPages} • LumigiaBOT` });

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('Leaderboard command error:', error);
    await interaction.reply({
      embeds: [errorEmbed('❌ An error occurred while fetching the leaderboard.')],
      ephemeral: true,
    }).catch(() => {});
  }
}
