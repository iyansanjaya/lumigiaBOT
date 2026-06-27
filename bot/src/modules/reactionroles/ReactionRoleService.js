/**
 * LumigiaBOT — Layanan Reaction Role
 * Mengelola logika bisnis panel reaction role: membangun embed,
 * membuat tombol, mengirim panel, dan menangani toggle role.
 */

import {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} from 'discord.js';
import ReactionRoleRepo from '../../database/repositories/ReactionRoleRepo.js';
import { logger } from '../../utils/Logger.js';

/** Peta nama style ke ButtonStyle enum */
const STYLE_MAP = {
  primary: ButtonStyle.Primary,
  secondary: ButtonStyle.Secondary,
  success: ButtonStyle.Success,
  danger: ButtonStyle.Danger,
};

/** Batas Discord: 5 tombol per baris, 5 baris per pesan */
const MAX_BUTTONS_PER_ROW = 5;
const MAX_ROWS = 5;

/**
 * Mendapatkan instance ReactionRoleRepo dari database.
 * @param {import('../../core/BotClient.js').default} client
 * @returns {ReactionRoleRepo}
 */
export function getRepo(client) {
  return client.db.reactionRoles;
}

export default class ReactionRoleService {
  /**
   * Membangun embed panel reaction role.
   * @param {object} panel - Data panel dari database
   * @param {object[]} entries - Entri role dari database
   * @returns {EmbedBuilder}
   */
  static buildPanelEmbed(panel, entries) {
    const embed = new EmbedBuilder()
      .setTitle(panel.title)
      .setColor(parseInt(panel.color.replace('#', ''), 16))
      .setTimestamp()
      .setFooter({ text: 'LumigiaBOT • Reaction Roles' });

    // Bangun deskripsi panel
    const parts = [];
    if (panel.description) {
      parts.push(panel.description);
      parts.push('');
    }

    if (entries.length > 0) {
      for (const entry of entries) {
        const emoji = entry.emoji ? `${entry.emoji} ` : '';
        const desc = entry.description ? ` — ${entry.description}` : '';
        parts.push(`${emoji}**${entry.label}**${desc}`);
      }
    } else {
      parts.push('*No roles configured yet.*');
    }

    // Tambahkan info mode
    const modeLabels = {
      toggle: '🔄 Toggle — click to add/remove roles',
      single: '☝️ Single — only one role at a time',
      verify: '✅ Verify — one-time role assignment',
    };
    parts.push('');
    parts.push(`> ${modeLabels[panel.mode] || modeLabels.toggle}`);

    embed.setDescription(parts.join('\n'));

    return embed;
  }

  /**
   * Membangun ActionRow dengan tombol untuk setiap entri role.
   * Maks 5 tombol per baris, maks 5 baris (25 tombol total).
   * @param {object[]} entries - Entri role dari database
   * @returns {ActionRowBuilder[]}
   */
  static buildPanelButtons(entries) {
    if (entries.length === 0) return [];

    const maxEntries = MAX_BUTTONS_PER_ROW * MAX_ROWS;
    const limitedEntries = entries.slice(0, maxEntries);
    const rows = [];

    for (let i = 0; i < limitedEntries.length; i += MAX_BUTTONS_PER_ROW) {
      const chunk = limitedEntries.slice(i, i + MAX_BUTTONS_PER_ROW);
      const row = new ActionRowBuilder();

      for (const entry of chunk) {
        const label = entry.emoji ? `${entry.emoji} ${entry.label}` : entry.label;
        const style = STYLE_MAP[entry.style] ?? ButtonStyle.Secondary;

        const button = new ButtonBuilder()
          .setCustomId(`rr_toggle_${entry.panel_id}_${entry.id}`)
          .setLabel(label)
          .setStyle(style);

        row.addComponents(button);
      }

      rows.push(row);
    }

    return rows;
  }

  /**
   * Mengirim panel embed + tombol ke channel dan memperbarui message_id di DB.
   * @param {import('../../core/BotClient.js').default} client
   * @param {object} panel - Data panel dari database
   * @param {object[]} entries - Entri role dari database
   * @param {import('discord.js').TextChannel} channel - Channel tujuan
   * @returns {Promise<import('discord.js').Message>}
   */
  static async sendPanel(client, panel, entries, channel) {
    const repo = getRepo(client);
    const embed = ReactionRoleService.buildPanelEmbed(panel, entries);
    const components = ReactionRoleService.buildPanelButtons(entries);

    // Jika panel sudah punya pesan sebelumnya, coba hapus dulu
    if (panel.message_id) {
      try {
        const oldMsg = await channel.messages.fetch(panel.message_id);
        if (oldMsg) await oldMsg.delete();
      } catch {
        // Pesan lama mungkin sudah dihapus — abaikan
      }
    }

    const message = await channel.send({ embeds: [embed], components });
    repo.updatePanelMessage(panel.id, message.id);

    logger.info(`Reaction role panel #${panel.id} sent to #${channel.name} (msg: ${message.id})`);
    return message;
  }

  /**
   * Menangani toggle role saat member mengklik tombol.
   * Mode toggle: tambahkan jika belum punya, hapus jika sudah punya.
   * Mode single: hapus semua role panel lain dulu, lalu tambahkan.
   * Mode verify: hanya tambahkan, tidak bisa dihapus.
   * @param {import('discord.js').ButtonInteraction} interaction
   * @param {number} panelId
   * @param {number} entryId
   */
  static async handleToggle(interaction, panelId, entryId) {
    const client = interaction.client;
    const repo = getRepo(client);
    const member = interaction.member;

    // Ambil data panel dan entri
    const panel = repo.getPanel(panelId);
    if (!panel) {
      return interaction.reply({
        content: '❌ This role panel no longer exists.',
        ephemeral: true,
      });
    }

    const entry = repo.getEntry(entryId);
    if (!entry || entry.panel_id !== panelId) {
      return interaction.reply({
        content: '❌ This role option is no longer available.',
        ephemeral: true,
      });
    }

    const role = interaction.guild.roles.cache.get(entry.role_id);
    if (!role) {
      return interaction.reply({
        content: '❌ The associated role no longer exists in this server.',
        ephemeral: true,
      });
    }

    // Periksa hierarki role — bot harus bisa mengelola role ini
    const botMember = interaction.guild.members.me;
    if (role.position >= botMember.roles.highest.position) {
      return interaction.reply({
        content: '❌ I cannot manage this role — it is above my highest role.',
        ephemeral: true,
      });
    }

    const hasRole = member.roles.cache.has(role.id);

    try {
      switch (panel.mode) {
        case 'toggle': {
          if (hasRole) {
            await member.roles.remove(role);
            return interaction.reply({
              content: `➖ Removed the **${role.name}** role.`,
              ephemeral: true,
            });
          }
          await member.roles.add(role);
          return interaction.reply({
            content: `➕ Added the **${role.name}** role.`,
            ephemeral: true,
          });
        }

        case 'single': {
          // Hapus semua role lain dari panel ini terlebih dahulu
          const allEntries = repo.getEntries(panelId);
          const rolesToRemove = allEntries
            .filter((e) => e.id !== entryId && member.roles.cache.has(e.role_id))
            .map((e) => e.role_id);

          if (rolesToRemove.length > 0) {
            await member.roles.remove(rolesToRemove);
          }

          // Jika sudah punya role yang sama, berarti ingin switch — jangan hapus
          if (!hasRole) {
            await member.roles.add(role);
          }

          return interaction.reply({
            content: `✅ Switched to the **${role.name}** role.`,
            ephemeral: true,
          });
        }

        case 'verify': {
          if (hasRole) {
            return interaction.reply({
              content: `ℹ️ You already have the **${role.name}** role.`,
              ephemeral: true,
            });
          }
          await member.roles.add(role);
          return interaction.reply({
            content: `✅ You have been verified with the **${role.name}** role.`,
            ephemeral: true,
          });
        }

        default: {
          return interaction.reply({
            content: '❌ Unknown panel mode.',
            ephemeral: true,
          });
        }
      }
    } catch (error) {
      logger.error(`Reaction role toggle error (panel: ${panelId}, entry: ${entryId}):`, error);
      return interaction.reply({
        content: '❌ Failed to update your roles. Please try again or contact an admin.',
        ephemeral: true,
      });
    }
  }
}
