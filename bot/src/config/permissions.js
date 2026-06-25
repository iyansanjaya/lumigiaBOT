/**
 * LumigiaBOT — Definisi Level Permission
 * Mendefinisikan level permission berjenjang untuk kontrol akses perintah.
 */

import { PermissionFlagsBits } from 'discord.js';

/**
 * Level permission dari terendah ke tertinggi.
 * Setiap level memiliki fungsi pengecekan yang menentukan apakah member memenuhi syarat.
 */
export const PermissionLevels = [
  {
    level: 0,
    name: 'User',
    check: () => true,
  },
  {
    level: 1,
    name: 'Moderator',
    check: (member) =>
      member.permissions.has(PermissionFlagsBits.ManageMessages) ||
      member.permissions.has(PermissionFlagsBits.ModerateMembers),
  },
  {
    level: 2,
    name: 'Administrator',
    check: (member) =>
      member.permissions.has(PermissionFlagsBits.Administrator),
  },
  {
    level: 3,
    name: 'Server Owner',
    check: (member) => member.id === member.guild.ownerId,
  },
  {
    level: 4,
    name: 'Bot Owner',
    check: (member) => member.id === process.env.BOT_OWNER_ID,
  },
];

/**
 * Mendapatkan level permission dari anggota guild.
 * @param {import('discord.js').GuildMember} member
 * @returns {number} Level permission tertinggi yang memenuhi syarat untuk member tersebut
 */
export function getPermissionLevel(member) {
  let level = 0;

  for (const perm of PermissionLevels) {
    if (perm.check(member)) {
      level = perm.level;
    }
  }

  return level;
}

/**
 * Mendapatkan nama tampilan untuk level permission.
 * @param {number} level
 * @returns {string}
 */
export function getPermissionName(level) {
  const perm = PermissionLevels.find((p) => p.level === level);
  return perm?.name ?? 'Unknown';
}
