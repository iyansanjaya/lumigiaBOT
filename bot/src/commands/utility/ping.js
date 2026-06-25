/**
 * LumigiaBOT — Perintah /ping
 * Menampilkan latensi bot dan latensi API WebSocket.
 */

import { SlashCommandBuilder } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 3000;

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Check bot latency and API response time');

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    const latency = Date.now() - interaction.createdTimestamp;
    const apiLatency = Math.round(client.ws.ping);

    const msg = t(client, interaction.guildId, 'commands.ping.response', {
      latency,
      api: apiLatency,
    });

    await interaction.reply({ embeds: [successEmbed(msg)] });
  } catch (error) {
    logger.error('ping command error:', error);
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
  }
}
