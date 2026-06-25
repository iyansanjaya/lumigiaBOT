/**
 * LumigiaBOT — Event Pembuatan Interaksi
 * Merutekan semua interaksi: slash command, tombol, modal, select menu.
 */

import { InteractionType } from 'discord.js';
import { checkCooldown } from '../../core/CooldownManager.js';
import { t } from '../../i18n/helpers.js';
import { errorEmbed } from '../../utils/EmbedBuilder.js';
import { logger } from '../../utils/Logger.js';

export const name = 'interactionCreate';
export const once = false;

export async function execute(interaction, client) {
  try {
    // --- Slash Command ---
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      // Periksa cooldown
      const remaining = checkCooldown(client, interaction.commandName, interaction.user.id, command.cooldown);
      if (remaining > 0) {
        const msg = t(client, interaction.guildId, 'errors.cooldown', { seconds: remaining });
        return interaction.reply({ embeds: [errorEmbed(msg)], ephemeral: true });
      }

      await command.execute(interaction, client);
      return;
    }

    // --- Tombol ---
    if (interaction.isButton()) {
      const button = client.buttons.get(interaction.customId);
      if (button) {
        await button.execute(interaction, client);
      }
      return;
    }

    // --- Modal ---
    if (interaction.type === InteractionType.ModalSubmit) {
      const modal = client.modals.get(interaction.customId);
      if (modal) {
        await modal.execute(interaction, client);
      }
      return;
    }

    // --- Select Menu ---
    if (interaction.isAnySelectMenu()) {
      const menu = client.selectMenus.get(interaction.customId);
      if (menu) {
        await menu.execute(interaction, client);
      }
      return;
    }
  } catch (error) {
    logger.error(`Interaction error (${interaction.commandName ?? interaction.customId}):`, error);

    const msg = t(client, interaction.guildId, 'errors.unknown');
    const payload = { embeds: [errorEmbed(msg)], ephemeral: true };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
}
