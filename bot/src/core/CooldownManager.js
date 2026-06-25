/**
 * LumigiaBOT — Manajer Cooldown
 * Mencegah penyalahgunaan perintah melalui cooldown per-pengguna, per-perintah.
 */

import { Collection } from 'discord.js';
import { Cooldowns } from '../config/constants.js';

/**
 * Memeriksa apakah pengguna sedang dalam cooldown untuk sebuah perintah.
 * Mengembalikan sisa waktu dalam detik jika dalam cooldown, atau 0 jika bebas.
 *
 * @param {import('./BotClient.js').default} client
 * @param {string} commandName
 * @param {string} userId
 * @param {number} [cooldownMs] - Cooldown kustom dalam ms; menggunakan command.cooldown atau default jika tidak ada
 * @returns {number} Sisa cooldown dalam detik (0 = tidak ada cooldown)
 */
export function checkCooldown(client, commandName, userId, cooldownMs) {
  if (!client.cooldowns.has(commandName)) {
    client.cooldowns.set(commandName, new Collection());
  }

  const timestamps = client.cooldowns.get(commandName);
  const cooldown = cooldownMs ?? Cooldowns.DEFAULT;
  const now = Date.now();

  if (timestamps.has(userId)) {
    const expiresAt = timestamps.get(userId) + cooldown;

    if (now < expiresAt) {
      return Math.ceil((expiresAt - now) / 1000);
    }
  }

  timestamps.set(userId, now);

  // Pembersihan otomatis setelah cooldown berakhir
  setTimeout(() => timestamps.delete(userId), cooldown);

  return 0;
}
