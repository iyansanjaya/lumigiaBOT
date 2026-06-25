/**
 * LumigiaBOT — Perintah /ticket-config
 * Mengonfigurasi pengaturan sistem tiket untuk server.
 * Subperintah: support-role, log-channel, max-open, auto-close.
 * Membutuhkan izin ManageGuild.
 */

import { SlashCommandBuilder, PermissionFlagsBits, ChannelType } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';

export const cooldown = 10000;

export const data = new SlashCommandBuilder()
  .setName('ticket-config')
  .setDescription('Configure the ticket system')
  .addSubcommand((sub) =>
    sub
      .setName('support-role')
      .setDescription('Set the support team role')
      .addRoleOption((option) =>
        option.setName('role').setDescription('The support role').setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('log-channel')
      .setDescription('Set the ticket log channel')
      .addChannelOption((option) =>
        option
          .setName('channel')
          .setDescription('Channel for ticket transcripts')
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('max-open')
      .setDescription('Set maximum open tickets per user')
      .addIntegerOption((option) =>
        option
          .setName('amount')
          .setDescription('Max open tickets (1-5)')
          .setMinValue(1)
          .setMaxValue(5)
          .setRequired(true),
      ),
  )
  .addSubcommand((sub) =>
    sub
      .setName('auto-close')
      .setDescription('Set auto-close timeout for inactive tickets')
      .addIntegerOption((option) =>
        option
          .setName('hours')
          .setDescription('Hours before auto-close (1-168)')
          .setMinValue(1)
          .setMaxValue(168)
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
      // --- Role Dukungan ---
      case 'support-role': {
        const role = interaction.options.getRole('role');
        client.db.guildSettings.set(interaction.guildId, 'ticket_support_role', role.id);
        await interaction.reply({
          embeds: [successEmbed(`✅ Support role set to ${role}.`)],
          ephemeral: true,
        });
        break;
      }

      // --- Channel Log ---
      case 'log-channel': {
        const channel = interaction.options.getChannel('channel');
        client.db.guildSettings.set(interaction.guildId, 'ticket_log_channel', channel.id);
        await interaction.reply({
          embeds: [successEmbed(`✅ Ticket log channel set to ${channel}.`)],
          ephemeral: true,
        });
        break;
      }

      // --- Maksimal Tiket Terbuka ---
      case 'max-open': {
        const amount = interaction.options.getInteger('amount');
        client.db.guildSettings.set(interaction.guildId, 'ticket_max_open', amount);
        await interaction.reply({
          embeds: [successEmbed(`✅ Max open tickets per user set to **${amount}**.`)],
          ephemeral: true,
        });
        break;
      }

      // --- Tutup Otomatis ---
      case 'auto-close': {
        const hours = interaction.options.getInteger('hours');
        client.db.guildSettings.set(interaction.guildId, 'ticket_auto_close_hours', hours);
        await interaction.reply({
          embeds: [successEmbed(`✅ Tickets will auto-close after **${hours}** hours of inactivity.`)],
          ephemeral: true,
        });
        break;
      }
    }

    logger.info(`Ticket config updated: ${subcommand} by ${interaction.user.tag}`);
  } catch (error) {
    logger.error('ticket-config error:', error);
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true }).catch(() => {});
  }
}
