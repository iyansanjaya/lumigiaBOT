/**
 * LumigiaBOT — Perintah /analytics
 * Menampilkan statistik server dan channel paling aktif.
 * Subperintah: stats, top-channels.
 * Memerlukan izin ManageGuild.
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { createEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 10000;

export const data = new SlashCommandBuilder()
  .setName('analytics')
  .setDescription('View server analytics and statistics')
  .addSubcommand((sub) =>
    sub.setName('stats').setDescription('Show server stats for today and 7-day summary'),
  )
  .addSubcommand((sub) =>
    sub
      .setName('top-channels')
      .setDescription('Show top 10 most active channels')
      .addIntegerOption((option) =>
        option
          .setName('days')
          .setDescription('Number of days to look back (default: 7)')
          .setMinValue(1)
          .setMaxValue(90)
          .setRequired(false),
      ),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

/**
 * Format angka dengan separator ribuan.
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
  return (num ?? 0).toLocaleString('en-US');
}

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 */
export async function execute(interaction) {
  const client = interaction.client;
  const guildId = interaction.guildId;
  const subcommand = interaction.options.getSubcommand();

  try {
    const repo = client.db?.analytics;
    if (!repo) {
      await interaction.reply({
        embeds: [errorEmbed('❌ Analytics module is not available.')],
        ephemeral: true,
      });
      return;
    }

    switch (subcommand) {
      // ── Stats: Today + 7-Day Summary ──
      case 'stats': {
        const today = repo.getStatsToday(guildId);
        const weekData = repo.getDailyStats(guildId, 7);

        // Aggregate 7-day totals
        const weekTotals = weekData.reduce(
          (acc, day) => {
            acc.messages += day.messages ?? 0;
            acc.joined += day.members_joined ?? 0;
            acc.left += day.members_left ?? 0;
            return acc;
          },
          { messages: 0, joined: 0, left: 0 },
        );

        const trendLines = [
          `📨 **${formatNumber(weekTotals.messages)}** messages`,
          `📥 **+${formatNumber(weekTotals.joined)}** members joined`,
          `📤 **-${formatNumber(weekTotals.left)}** members left`,
        ];

        const embed = createEmbed('info')
          .setTitle('📊 Server Analytics')
          .setDescription(
            `**7-Day Summary**\n${trendLines.join('\n')}`,
          )
          .addFields(
            {
              name: '💬 Messages Today',
              value: formatNumber(today?.messages),
              inline: true,
            },
            {
              name: '📥 Joined Today',
              value: formatNumber(today?.members_joined),
              inline: true,
            },
            {
              name: '📤 Left Today',
              value: formatNumber(today?.members_left),
              inline: true,
            },
          );

        await interaction.reply({ embeds: [embed] });
        break;
      }

      // ── Top Channels ──
      case 'top-channels': {
        const days = interaction.options.getInteger('days') ?? 7;
        const channels = repo.getTopChannels(guildId, days, 10);

        if (!channels.length) {
          await interaction.reply({
            embeds: [
              createEmbed('info')
                .setTitle('📊 Top Channels')
                .setDescription(`No channel activity recorded in the last **${days}** days.`),
            ],
            ephemeral: true,
          });
          return;
        }

        const list = channels
          .map((ch, i) => {
            const medal = i < 3 ? ['🥇', '🥈', '🥉'][i] : `**${i + 1}.**`;
            return `${medal} <#${ch.channel_id}> — **${formatNumber(ch.total_messages)}** messages`;
          })
          .join('\n');

        const embed = createEmbed('info')
          .setTitle('📊 Top Channels')
          .setDescription(
            `Most active channels in the last **${days}** day${days === 1 ? '' : 's'}:\n\n${list}`,
          );

        await interaction.reply({ embeds: [embed] });
        break;
      }
    }

    logger.info(`Analytics "${subcommand}" viewed by ${interaction.user.tag} in ${guildId}`);
  } catch (error) {
    logger.error('analytics command error:', error);
    const reply = { embeds: [errorEmbed('❌ An error occurred while fetching analytics.')], ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply).catch(() => {});
    } else {
      await interaction.reply(reply).catch(() => {});
    }
  }
}
