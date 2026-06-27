/**
 * LumigiaBOT — Penanganan Tombol rr_toggle
 * Menangani klik tombol reaction role panel.
 * Menggunakan startsWith matching untuk mencocokkan customId dinamis
 * dengan format: rr_toggle_{panelId}_{entryId}
 */

import ReactionRoleService from '../../modules/reactionroles/ReactionRoleService.js';
import { logger } from '../../utils/Logger.js';

export const customId = 'rr_toggle';
export const startsWith = true;

/**
 * @param {import('discord.js').ButtonInteraction} interaction
 * @param {import('../../core/BotClient.js').default} client
 */
export async function execute(interaction, client) {
  try {
    // Parse customId: rr_toggle_{panelId}_{entryId}
    const parts = interaction.customId.split('_');
    // parts = ['rr', 'toggle', panelId, entryId]
    const panelId = parseInt(parts[2], 10);
    const entryId = parseInt(parts[3], 10);

    if (isNaN(panelId) || isNaN(entryId)) {
      return interaction.reply({
        content: '❌ Invalid button data.',
        ephemeral: true,
      });
    }

    await ReactionRoleService.handleToggle(interaction, panelId, entryId);
  } catch (error) {
    logger.error('rr_toggle button error:', error);

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: '❌ An error occurred while updating your roles.',
        ephemeral: true,
      }).catch(() => {});
    }
  }
}
