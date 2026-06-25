/**
 * LumigiaBOT — Modal Alasan Peringatan
 * Menangani pengiriman modal untuk memberikan peringatan dengan alasan.
 * ID pengguna target disematkan dalam customId sebagai 'warn_reason_<userId>'.
 */

import { t } from '../../i18n/helpers.js';
import { successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import ModerationService from '../../modules/moderation/ModerationService.js';

/** @type {string} */
export const customId = 'warn_reason';

/**
 * @param {import('discord.js').ModalSubmitInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    // Ekstrak ID pengguna target dari pola customId: 'warn_reason_<userId>'
    const parts = interaction.customId.split('_');
    const targetId = parts[2];

    if (!targetId) {
      const msg = t(client, interaction.guildId, 'errors.unknown');
      return interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
    }

    const reason = interaction.fields.getTextInputValue('reason') || 'No reason provided';
    const member = await interaction.guild.members.fetch(targetId).catch(() => null);

    if (!member) {
      return interaction.reply({
        embeds: [errorEmbed('❌ Could not find that user in this server.')],
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const result = await ModerationService.warn(
      client, interaction.guild, interaction.member, member, reason,
    );

    let description = t(client, interaction.guildId, 'commands.warn.success', {
      user: member.user.tag,
      count: result.count,
    });

    if (result.noDm) {
      description += `\n${t(client, interaction.guildId, 'commands.ban.no_dm')}`;
    }

    await interaction.editReply({ embeds: [successEmbed(description)] });

    // Beritahu tentang eskalasi
    if (result.escalation) {
      const escalationMsg = t(client, interaction.guildId, 'commands.warn.escalation', {
        action: result.escalation.action,
        user: member.user.tag,
        count: result.escalation.count,
      });
      await interaction.followUp({ embeds: [successEmbed(escalationMsg)] });
    }
  } catch (error) {
    const msg = t(client, interaction.guildId, 'errors.unknown');
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [errorEmbed(msg)] });
    } else {
      await interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
    }
  }
}
