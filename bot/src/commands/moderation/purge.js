/**
 * LumigiaBOT — Perintah /purge
 * Menghapus pesan secara massal dari channel dengan filter pengguna opsional.
 */

import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { successEmbed, errorEmbed } from '../../utils/EmbedBuilder.js';
import { Cooldowns, Limits } from '../../config/constants.js';

/** @type {number} */
export const cooldown = Cooldowns.MODERATION;

export const data = new SlashCommandBuilder()
  .setName('purge')
  .setDescription('Bulk-delete messages from the channel')
  .addIntegerOption((opt) =>
    opt
      .setName('amount')
      .setDescription('Number of messages to delete (1-100)')
      .setMinValue(Limits.PURGE_MIN)
      .setMaxValue(Limits.PURGE_MAX)
      .setRequired(true),
  )
  .addUserOption((opt) =>
    opt.setName('user').setDescription('Only delete messages from this user').setRequired(false),
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages);

/**
 * @param {import('discord.js').ChatInputCommandInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  const amount = interaction.options.getInteger('amount');
  const targetUser = interaction.options.getUser('user');

  await interaction.deferReply({ ephemeral: true });

  try {
    let deleted;

    if (targetUser) {
      // Mengambil pesan dan memfilter berdasarkan pengguna, lalu hapus massal
      const fetched = await interaction.channel.messages.fetch({ limit: 100 });
      const filtered = fetched
        .filter((msg) => msg.author.id === targetUser.id)
        .first(amount);

      deleted = await interaction.channel.bulkDelete(filtered, true);
    } else {
      // Penghapusan massal standar
      deleted = await interaction.channel.bulkDelete(amount, true);
    }

    // Mencatat aksi ke log
    client.db.auditLogs.add(
      interaction.guildId, 'PURGE', interaction.user.id, targetUser?.id ?? null,
      `Purged ${deleted.size} messages`, { channel: interaction.channel.id },
    );

    const msg = t(client, interaction.guildId, 'commands.purge.success', { count: deleted.size });
    const reply = await interaction.editReply({ embeds: [successEmbed(msg)] });

    // Menghapus balasan secara otomatis setelah 5 detik
    setTimeout(() => reply.delete().catch(() => {}), 5000);
  } catch (error) {
    const msg = t(client, interaction.guildId, 'commands.purge.failed');
    await interaction.editReply({ embeds: [errorEmbed(msg)] });
  }
}
