/**
 * LumigiaBOT — Pabrik Embed Builder
 * Membuat embed yang konsisten dan sesuai brand di seluruh bot.
 */

import { EmbedBuilder } from 'discord.js';
import { Colors } from '../config/constants.js';

/**
 * Membuat embed bermerek dengan tipe warna yang diberikan.
 * @param {'primary'|'success'|'warning'|'error'|'info'|'moderation'|'ticket'|'automod'} type
 * @returns {EmbedBuilder}
 */
export function createEmbed(type = 'primary') {
  const colorMap = {
    primary: Colors.PRIMARY,
    success: Colors.SUCCESS,
    warning: Colors.WARNING,
    error: Colors.ERROR,
    info: Colors.INFO,
    moderation: Colors.MODERATION,
    ticket: Colors.TICKET,
    automod: Colors.AUTOMOD,
  };

  return new EmbedBuilder()
    .setColor(colorMap[type] ?? Colors.PRIMARY)
    .setTimestamp()
    .setFooter({ text: 'LumigiaBOT' });
}

/**
 * Membuat embed sukses dengan sebuah pesan.
 * @param {string} description
 * @returns {EmbedBuilder}
 */
export function successEmbed(description) {
  return createEmbed('success').setDescription(description);
}

/**
 * Membuat embed error dengan sebuah pesan.
 * @param {string} description
 * @returns {EmbedBuilder}
 */
export function errorEmbed(description) {
  return createEmbed('error').setDescription(description);
}

/**
 * Membuat embed aksi moderasi.
 * @param {object} options
 * @param {string} options.action - contoh: "Ban", "Kick"
 * @param {import('discord.js').User} options.target
 * @param {import('discord.js').User} options.moderator
 * @param {string} options.reason
 * @param {string} [options.duration]
 * @returns {EmbedBuilder}
 */
export function modEmbed({ action, target, moderator, reason, duration }) {
  const embed = createEmbed('moderation')
    .setTitle(`🔨 ${action}`)
    .addFields(
      { name: 'Target', value: `${target} (${target.id})`, inline: true },
      { name: 'Moderator', value: `${moderator}`, inline: true },
      { name: 'Reason', value: reason || 'No reason provided' },
    );

  if (duration) {
    embed.addFields({ name: 'Duration', value: duration, inline: true });
  }

  return embed;
}
