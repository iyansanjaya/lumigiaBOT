/**
 * LumigiaBOT — Perintah /setup
 * Wizard pengaturan interaktif yang menampilkan status konfigurasi saat ini
 * dan memandu admin melalui konfigurasi modul.
 * Memerlukan izin ManageGuild.
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { createEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 10000;

export const data = new SlashCommandBuilder()
  .setName('setup')
  .setDescription('Interactive setup wizard for configuring LumigiaBOT')
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    const settings = client.db.guildSettings.get(interaction.guildId);

    // --- Membuat indikator status ---
    const check = (value) => (value ? '✅' : '❌');
    const display = (value, fallback = 'Not set') =>
      value ? `<#${value}>` : `*${fallback}*`;
    const displayRole = (value, fallback = 'Not set') =>
      value ? `<@&${value}>` : `*${fallback}*`;

    // --- Membuat embed pengaturan ---
    const embed = createEmbed('primary')
      .setTitle(t(client, interaction.guildId, 'commands.setup.title'))
      .setDescription(t(client, interaction.guildId, 'commands.setup.description'))
      .addFields(
        {
          name: `🛡️ Moderation ${check(settings?.mod_log_channel)}`,
          value: [
            `**Log Channel:** ${display(settings?.mod_log_channel)}`,
            `**Warn Escalation:** Configured`,
            '',
            '`/settings mod-log #channel` — Set mod log channel',
          ].join('\n'),
        },
        {
          name: `📩 Tickets ${check(settings?.ticket_support_role && settings?.ticket_log_channel)}`,
          value: [
            `**Support Role:** ${displayRole(settings?.ticket_support_role)}`,
            `**Log Channel:** ${display(settings?.ticket_log_channel)}`,
            `**Max Open:** ${settings?.ticket_max_open ?? 1}`,
            `**Auto-Close:** ${settings?.ticket_auto_close_hours ?? 48}h`,
            '',
            '`/ticket-config support-role @role`',
            '`/ticket-config log-channel #channel`',
            '`/ticket-setup #channel` — Deploy ticket panel',
          ].join('\n'),
        },
        {
          name: `🤖 AutoMod ${check(settings?.automod_log_channel)}`,
          value: [
            `**Log Channel:** ${display(settings?.automod_log_channel)}`,
            '',
            '`/settings mod-log #channel` — Configure logging',
          ].join('\n'),
          inline: false,
        },
        {
          name: `🌐 Language`,
          value: [
            `**Current:** \`${settings?.language ?? 'en-US'}\``,
            '',
            '`/settings language en-US` or `/settings language id`',
          ].join('\n'),
          inline: false,
        },
      );

    await interaction.reply({ embeds: [embed] });

    logger.info(`Setup wizard viewed by ${interaction.user.tag} in ${interaction.guild.name}`);
  } catch (error) {
    logger.error('setup command error:', error);
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
  }
}
