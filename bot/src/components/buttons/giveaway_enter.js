/**
 * LumigiaBOT — Penanganan Tombol giveaway_enter
 * Menangani klik tombol entri giveaway.
 * Menggunakan startsWith matching untuk mencocokkan customId dinamis
 * dengan format: giveaway_enter_{giveawayId}
 */

import { ActionRowBuilder } from 'discord.js';
import GiveawayService from '../../modules/giveaway/GiveawayService.js';
import { logger } from '../../utils/Logger.js';

export const customId = 'giveaway_enter';
export const startsWith = true;

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    // Parse customId: giveaway_enter_{giveawayId}
    const parts = interaction.customId.split('_');
    // parts = ['giveaway', 'enter', giveawayId]
    const giveawayId = parseInt(parts[2], 10);

    if (isNaN(giveawayId)) {
      return interaction.reply({
        content: '❌ Invalid giveaway data.',
        ephemeral: true,
      });
    }

    // Cek giveaway ada
    const giveaway = client.db.giveaways.get(giveawayId);
    if (!giveaway) {
      return interaction.reply({
        content: '❌ This giveaway no longer exists.',
        ephemeral: true,
      });
    }

    // Cek giveaway belum ended
    if (giveaway.ended) {
      return interaction.reply({
        content: '⏰ This giveaway has already ended!',
        ephemeral: true,
      });
    }

    // Cek required role
    if (giveaway.required_role) {
      const member = interaction.member;
      if (!member.roles.cache.has(giveaway.required_role)) {
        return interaction.reply({
          content: `🔒 You need the <@&${giveaway.required_role}> role to enter this giveaway.`,
          ephemeral: true,
        });
      }
    }

    const userId = interaction.user.id;
    const hasEntered = client.db.giveaways.hasEntered(giveawayId, userId);

    let replyMessage;
    if (hasEntered) {
      // Hapus entri
      client.db.giveaways.removeEntry(giveawayId, userId);
      replyMessage = '👋 You left the giveaway.';
    } else {
      // Tambah entri
      client.db.giveaways.addEntry(giveawayId, userId);
      replyMessage = '🎉 You entered the giveaway! Good luck!';
    }

    // Hitung entri baru dan update tombol
    const newCount = client.db.giveaways.countEntries(giveawayId);
    const updatedButton = GiveawayService.buildEntryButton(giveawayId, newCount);
    const row = new ActionRowBuilder().addComponents(updatedButton);

    // Update pesan dengan tombol baru (tanpa mengubah embed)
    await interaction.update({ components: [row] });

    // Kirim balasan ephemeral
    await interaction.followUp({
      content: replyMessage,
      ephemeral: true,
    });
  } catch (error) {
    logger.error('giveaway_enter button error:', error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ An error occurred while processing your entry.',
        ephemeral: true,
      }).catch(() => {});
    }
  }
}
