/**
 * LumigiaBOT — Perintah /mute
 * Membisukan (timeout) pengguna untuk durasi tertentu (maks 28 hari).
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { canModerate } from '../../utils/Validator.js';
import { parseDuration, formatDuration, maxTimeoutDuration } from '../../utils/TimeFormatter.js';
import { Cooldowns } from '../../config/constants.js';
import ModerationService from '../../modules/moderation/ModerationService.js';

/** @type {number} */
export const cooldown = Cooldowns.MODERATION;

export const data = new SlashCommandBuilder()
  .setName('mute')
  .setDescription('Mute (timeout) a user for a specified duration')
  .addUserOption((opt) =>
    opt.setName('user').setDescription('The user to mute').setRequired(true),
  )
  .addStringOption((opt) =>
    opt.setName('duration').setDescription('Duration (e.g. 30m, 1h, 7d — max 28d)').setRequired(true),
  )
  .addStringOption((opt) =>
    opt.setName('reason').setDescription('Reason for the mute').setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers);

/** Alasan error → pemetaan kunci i18n */
const HIERARCHY_ERRORS = {
  self: 'errors.self_target',
  bot: 'errors.bot_target',
  owner: 'errors.owner_target',
  hierarchy: 'errors.hierarchy',
  bot_hierarchy: 'errors.bot_hierarchy',
};

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const member = interaction.options.getMember('user');
  const durationStr = interaction.options.getString('duration');
  const reason = interaction.options.getString('reason') || 'No reason provided';

  if (!member) {
    const msg = t(client, interaction.guildId, 'errors.unknown');
    return interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
  }

  // Pemeriksaan hierarki
  const check = canModerate(interaction.member, member);
  if (!check.allowed) {
    const msg = t(client, interaction.guildId, HIERARCHY_ERRORS[check.reason] ?? 'errors.unknown');
    return interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
  }

  // Mengurai dan memvalidasi durasi
  const durationMs = parseDuration(durationStr);
  if (!durationMs) {
    return interaction.reply({
      embeds: [errorEmbed('❌ Invalid duration format. Use formats like `30m`, `1h`, `7d`.')],
      ephemeral: true,
    });
  }

  if (durationMs > maxTimeoutDuration()) {
    return interaction.reply({
      embeds: [errorEmbed('❌ Maximum timeout duration is **28 days**.')],
      ephemeral: true,
    });
  }

  await interaction.deferReply();

  try {
    const result = await ModerationService.mute(
      client, interaction.guild, interaction.member, member, durationMs, reason,
    );

    const duration = formatDuration(durationMs);
    let description = t(client, interaction.guildId, 'commands.mute.success', {
      user: member.user.tag,
      duration,
    });
    if (result.noDm) {
      description += `\n${t(client, interaction.guildId, 'commands.ban.no_dm')}`;
    }

    await interaction.editReply({ embeds: [successEmbed(description)] });
  } catch (error) {
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.editReply({ embeds: [errorEmbed(msg)] });
  }
}
