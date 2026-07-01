/**
 * LumigiaBOT — Perintah /settings
 * Melihat dan mengonfigurasi pengaturan server.
 * Subperintah: view, language, mod-log.
 * Memerlukan izin ManageGuild.
 */

import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { createEmbed, successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';
import { LANGUAGE_OPTIONS } from '../../../../shared/contracts.js';

export const cooldown = 5000;

export const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('View and manage server settings')
  .addSubcommand((sub) =>
    sub.setName('view').setDescription('View all current server settings'),
  )
  .addSubcommand((sub) =>
    sub
      .setName('language')
      .setDescription('Set the server language')
      .addStringOption((option) =>
        option
          .setName('language')
          .setDescription('Language to use')
          .setRequired(true)
          .addChoices(...LANGUAGE_OPTIONS.map((language) => ({
            name: language.label,
            value: language.value,
          }))),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('mod-log')
      .setDescription('Set the moderation log channel')
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('Channel for moderation logs')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true),
      ),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const subcommand = interaction.options.getSubcommand();

  try {
    switch (subcommand) {
      // --- Lihat Semua Pengaturan ---
      case 'view': {
        const settings = client.db.guildSettings.get(interaction.guildId);
        const display = (val, type = 'channel') => {
          if (!val) return '*Not set*';
          if (type === 'channel') return `<#${val}>`;
          if (type === 'role') return `<@&${val}>`;
          return `\`${val}\``;
        };

        const embed = createEmbed('primary')
          .setTitle(t(client, interaction.guildId, 'commands.settings.title'))
          .addFields(
            {
              name: '🌐 General',
              value: [
                `**Language:** \`${settings?.language ?? 'en-US'}\``,
              ].join('\n'),
            },
            {
              name: '🛡️ Moderation',
              value: [
                `**Mod Log:** ${display(settings?.mod_log_channel)}`,
                `**AutoMod Log:** ${display(settings?.automod_log_channel)}`,
                `**Warn Escalation:** \`${settings?.warn_escalation ?? 'default'}\``,
              ].join('\n'),
            },
            {
              name: '📩 Tickets',
              value: [
                `**Support Role:** ${display(settings?.ticket_support_role, 'role')}`,
                `**Log Channel:** ${display(settings?.ticket_log_channel)}`,
                `**Max Open:** ${settings?.ticket_max_open ?? 1}`,
                `**Auto-Close:** ${settings?.ticket_auto_close_hours ?? 48}h`,
              ].join('\n'),
            },
            {
              name: '🚨 Anti-Raid',
              value: [
                `**Enabled:** ${settings?.anti_raid_enabled ? '✅' : '❌'}`,
                `**Threshold:** ${settings?.anti_raid_threshold ?? 10} joins`,
                `**Timeframe:** ${settings?.anti_raid_timeframe ?? 30}s`,
              ].join('\n'),
            },
            {
              name: '👋 Welcome',
              value: [
                `**Enabled:** ${settings?.welcome_enabled ? '✅' : '❌'}`,
                `**Channel:** ${display(settings?.welcome_channel)}`,
              ].join('\n'),
            },
          );

        await interaction.reply({ embeds: [embed] });
        break;
      }

      // --- Atur Bahasa ---
      case 'language': {
        const language = interaction.options.getString('language');
        client.db.guildSettings.set(interaction.guildId, 'language', language);

        const msg = t(client, interaction.guildId, 'commands.settings.language_set', { language });
        await interaction.reply({ embeds: [successEmbed(msg)], ephemeral: true });
        break;
      }

      // --- Atur Channel Log Moderasi ---
      case 'mod-log': {
        const channel = interaction.options.getChannel('channel');
        client.db.guildSettings.set(interaction.guildId, 'mod_log_channel', channel.id);

        await interaction.reply({
          embeds: [successEmbed(`✅ Moderation log channel set to ${channel}.`)],
          ephemeral: true,
        });
        break;
      }
    }

    logger.info(`Settings "${subcommand}" updated by ${interaction.user.tag}`);
  } catch (error) {
    logger.error('settings command error:', error);
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
  }
}
