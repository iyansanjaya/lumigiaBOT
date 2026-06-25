/**
 * LumigiaBOT — Pembangun Panel Tiket
 * Membangun panel pembuatan tiket (embed + tombol/menu pilihan)
 * yang dikirim ke channel yang ditentukan agar pengguna bisa membuka tiket.
 */

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} from 'discord.js';
import { t } from '../../i18n/helpers.js';
import { createEmbed } from '../../utils/EmbedBuilder.js';
import { TicketDefaults } from '../../config/constants.js';

/**
 * Membangun embed panel tiket dan komponen interaktif.
 *
 * @param {import('../../core/BotClient.js').default} client
 * @param {string} guildId
 * @returns {{ embeds: import('discord.js').EmbedBuilder[], components: import('discord.js').ActionRowBuilder[] }}
 */
export function buildTicketPanel(client, guildId) {
  // --- Bangun embed panel ---
  const embed = createEmbed('ticket')
    .setTitle(t(client, guildId, 'commands.ticket.panel_title'))
    .setDescription(t(client, guildId, 'commands.ticket.panel_description'));

  const components = [];

  // --- Menu pilihan kategori (jika tersedia beberapa kategori) ---
  const categories = TicketDefaults.CATEGORIES;
  if (categories.length > 1) {
    const categoryEmojis = {
      general: '📋',
      support: '🛠️',
      'bug-report': '🐛',
      partnership: '🤝',
    };

    const selectRow = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('ticket_category')
        .setPlaceholder('Select a category...')
        .addOptions(
          categories.map((cat) => ({
            label: cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' '),
            value: cat,
            emoji: categoryEmojis[cat] || '📁',
          })),
        ),
    );
    components.push(selectRow);
  }

  // --- Tombol Buka Tiket ---
  const buttonRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('ticket_create')
      .setLabel('Open Ticket')
      .setEmoji('📩')
      .setStyle(ButtonStyle.Primary),
  );
  components.push(buttonRow);

  return { embeds: [embed], components };
}
