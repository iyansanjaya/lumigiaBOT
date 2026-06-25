/**
 * LumigiaBOT — Perintah /lockdown
 * Mengunci atau membuka kunci channel dengan mengubah izin kirim @everyone.
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { Cooldowns } from '../../config/constants.js';

/** @type {number} */
export const cooldown = Cooldowns.MODERATION;

export const data = new SlashCommandBuilder()
  .setName('lockdown')
  .setDescription('Lock or unlock a channel')
  .addStringOption((opt) =>
    opt
      .setName('action')
      .setDescription('Lock or unlock the channel')
      .setRequired(true)
      .addChoices(
        { name: 'Lock', value: 'lock' },
        { name: 'Unlock', value: 'unlock' },
      ),
  )
  .addChannelOption((opt) =>
    opt.setName('channel').setDescription('Target channel (defaults to current)').setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const action = interaction.options.getString('action');
  const channel = interaction.options.getChannel('channel') ?? interaction.channel;

  await interaction.deferReply();

  try {
    const everyone = interaction.guild.roles.everyone;

    if (action === 'lock') {
      await channel.permissionOverwrites.edit(everyone, { SendMessages: false });

      client.db.auditLogs.add(
        interaction.guildId, 'LOCKDOWN', interaction.user.id, channel.id,
        'Channel locked',
      );

      const msg = t(client, interaction.guildId, 'commands.lockdown.locked', {
        channel: `${channel}`,
      });
      await interaction.editReply({ embeds: [successEmbed(msg)] });
    } else {
      // Membuka kunci — mengatur ulang ke pewarisan
      await channel.permissionOverwrites.edit(everyone, { SendMessages: null });

      client.db.auditLogs.add(
        interaction.guildId, 'LOCKDOWN', interaction.user.id, channel.id,
        'Channel unlocked',
      );

      const msg = t(client, interaction.guildId, 'commands.lockdown.unlocked', {
        channel: `${channel}`,
      });
      await interaction.editReply({ embeds: [successEmbed(msg)] });
    }
  } catch (error) {
    const msg = t(client, interaction.guildId, 'errors.unknown');
    await interaction.editReply({ embeds: [errorEmbed(msg)] });
  }
}
