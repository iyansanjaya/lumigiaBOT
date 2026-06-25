/**
 * LumigiaBOT — Perintah /ban
 * Mem-ban pengguna secara permanen dari server.
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { canModerate } from '../../utils/Validator.js';
import { Cooldowns } from '../../config/constants.js';
import ModerationService from '../../modules/moderation/ModerationService.js';

/** @type {number} */
export const cooldown = Cooldowns.MODERATION;

export const data = new SlashCommandBuilder()
  .setName('ban')
  .setDescription('Ban a user from the server')
  .addUserOption((opt) =>
    opt.setName('user').setDescription('The user to ban').setRequired(true),
  )
  .addStringOption((opt) =>
    opt.setName('reason').setDescription('Reason for the ban').setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers);

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
  const reason = interaction.options.getString('reason') || 'No reason provided';

  // Target harus berada di dalam guild
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

  await interaction.deferReply();

  try {
    const result = await ModerationService.ban(client, interaction.guild, interaction.member, member, reason);

    let description = t(client, interaction.guildId, 'commands.ban.success', { user: member.user.tag });
    if (result.noDm) {
      description += `\n${t(client, interaction.guildId, 'commands.ban.no_dm')}`;
    }

    await interaction.editReply({ embeds: [successEmbed(description)] });
  } catch (error) {
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.editReply({ embeds: [errorEmbed(msg)] });
  }
}
