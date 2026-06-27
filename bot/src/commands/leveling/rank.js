/**
 * LumigiaBOT — Perintah /rank
 * Menampilkan rank card user dengan XP, level, dan progress.
 * Tidak memerlukan izin khusus.
 */

import { SlashCommandBuilder } from 'discord.js';
import { LevelingService } from '../../modules/leveling/LevelingService.js';
import { errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 5000;

export const data = new SlashCommandBuilder()
  .setName('rank')
  .setDescription('View your or another user\'s rank card')
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('User to check rank for (default: yourself)')
      .setRequired(false),
  );

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const guildId = interaction.guildId;

    // Cek apakah leveling aktif
    const settings = client.db.leveling.getSettings(guildId);
    if (!settings || !settings.enabled) {
      return interaction.reply({
        embeds: [errorEmbed('❌ The leveling system is not enabled on this server.')],
        ephemeral: true,
      });
    }

    // Ambil data XP user
    const userData = client.db.leveling.getUser(guildId, targetUser.id);
    if (!userData) {
      return interaction.reply({
        embeds: [errorEmbed(`📭 ${targetUser} has no XP yet. Start chatting to earn XP!`)],
        ephemeral: true,
      });
    }

    // Ambil rank dan rewards
    const rank = client.db.leveling.getRank(guildId, targetUser.id);
    const rewards = client.db.leveling.getRewards(guildId);

    // Ambil member untuk display name
    const member = await interaction.guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      return interaction.reply({
        embeds: [errorEmbed('❌ Could not find that user in this server.')],
        ephemeral: true,
      });
    }

    // Bangun dan kirim rank embed
    const embed = LevelingService.buildRankEmbed(member, userData, rank, rewards);
    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('Rank command error:', error);
    await interaction.reply({
      embeds: [errorEmbed('❌ An error occurred while fetching the rank card.')],
      ephemeral: true,
    }).catch(() => {});
  }
}
