/**
 * LumigiaBOT — Perintah /avatar
 * Menampilkan avatar pengguna dalam resolusi tinggi dengan tautan format.
 */

import { SlashCommandBuilder } from 'discord.js';
import { createEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 3000;

export const data = new SlashCommandBuilder()
  .setName('avatar')
  .setDescription("Display a user's avatar in high resolution")
  .addUserOption((option) =>
    option
      .setName('user')
      .setDescription('User to view avatar of (defaults to yourself)')
      .setRequired(false),
  );

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    const user = interaction.options.getUser('user') || interaction.user;

    // Mendapatkan URL avatar dalam berbagai format
    const pngUrl = user.displayAvatarURL({ extension: 'png', size: 4096 });
    const jpgUrl = user.displayAvatarURL({ extension: 'jpg', size: 4096 });
    const webpUrl = user.displayAvatarURL({ extension: 'webp', size: 4096 });

    // Memeriksa apakah avatar beranimasi (GIF)
    const isAnimated = user.avatar?.startsWith('a_');
    const gifUrl = isAnimated
      ? user.displayAvatarURL({ extension: 'gif', size: 4096 })
      : null;

    // Membuat tautan format
    const formats = [
      `[PNG](${pngUrl})`,
      `[JPG](${jpgUrl})`,
      `[WebP](${webpUrl})`,
    ];
    if (gifUrl) formats.push(`[GIF](${gifUrl})`);

    const embed = createEmbed('info')
      .setTitle(`🖼️ Avatar — ${user.tag}`)
      .setDescription(`**Formats:** ${formats.join(' • ')}`)
      .setImage(isAnimated ? gifUrl : pngUrl);

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    logger.error('avatar command error:', error);
    const msg = '❌ An unexpected error occurred. Please try again.';
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
  }
}
