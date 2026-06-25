/**
 * LumigiaBOT — Validator Input
 * Membersihkan dan memvalidasi input pengguna untuk mencegah penyalahgunaan.
 */

import { Limits } from '../config/constants.js';

/**
 * Membersihkan string dengan menghapus eksploitasi format Discord.
 * @param {string} input
 * @returns {string}
 */
export function sanitize(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/@everyone/gi, '@\u200beveryone')
    .replace(/@here/gi, '@\u200bhere')
    .trim();
}

/**
 * Memvalidasi bahwa string alasan berada dalam batas yang dapat diterima.
 * @param {string} reason
 * @param {number} [maxLength]
 * @returns {{ valid: boolean, cleaned: string }}
 */
export function validateReason(reason, maxLength = Limits.WARN_REASON_MAX) {
  if (!reason || typeof reason !== 'string') {
    return { valid: true, cleaned: 'No reason provided' };
  }

  const cleaned = sanitize(reason);

  if (cleaned.length > maxLength) {
    return { valid: false, cleaned: cleaned.slice(0, maxLength) };
  }

  return { valid: true, cleaned };
}

/**
 * Memeriksa apakah member dapat memoderasi member lain (pengecekan hierarki).
 * @param {import('discord.js').GuildMember} moderator
 * @param {import('discord.js').GuildMember} target
 * @returns {{ allowed: boolean, reason?: string }}
 */
export function canModerate(moderator, target) {
  // Tidak bisa memoderasi diri sendiri
  if (moderator.id === target.id) {
    return { allowed: false, reason: 'self' };
  }

  // Tidak bisa memoderasi bot
  if (target.id === target.client.user.id) {
    return { allowed: false, reason: 'bot' };
  }

  // Tidak bisa memoderasi pemilik server
  if (target.id === target.guild.ownerId) {
    return { allowed: false, reason: 'owner' };
  }

  // Pengecekan hierarki role
  if (moderator.roles.highest.position <= target.roles.highest.position) {
    return { allowed: false, reason: 'hierarchy' };
  }

  // Pengecekan hierarki role bot
  const botMember = target.guild.members.me;
  if (botMember && botMember.roles.highest.position <= target.roles.highest.position) {
    return { allowed: false, reason: 'bot_hierarchy' };
  }

  return { allowed: true };
}

/**
 * Memvalidasi bahwa angka berada dalam rentang.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {boolean}
 */
export function isInRange(value, min, max) {
  return typeof value === 'number' && value >= min && value <= max;
}
