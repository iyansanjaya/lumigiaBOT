/**
 * LumigiaBOT — Layanan Moderasi
 * Logika bisnis utama untuk semua tindakan moderasi.
 * Menangani pemeriksaan hierarki, notifikasi DM, pencatatan audit,
 * dan eskalasi peringatan otomatis.
 */

import { canModerate, validateReason } from '../../utils/Validator.js';
import { t } from '../../i18n/helpers.js';
import { formatDuration } from '../../utils/TimeFormatter.js';
import { EscalationDefaults } from '../../config/constants.js';
import { logger } from '../../utils/Logger.js';
import ModerationLogger from './ModerationLogger.js';

function parseEscalationMap(value) {
  if (!value) return EscalationDefaults;
  if (value === 'none') return {};
  if (value === 'mute') return { 3: 'mute' };
  if (value === 'kick') return { 3: 'mute', 5: 'kick' };
  if (value === 'ban') return EscalationDefaults;

  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : EscalationDefaults;
  } catch {
    return EscalationDefaults;
  }
}

export default class ModerationService {
  // ──────────────────────────────────────────────
  //  BLOKIR (BAN)
  // ──────────────────────────────────────────────

  /**
   * Blokir (ban) seorang anggota dari server.
   *
   * @param {import('../../core/BotClient.js').default} client
   * @param {import('discord.js').Guild} guild
   * @param {import('discord.js').GuildMember} moderator
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   * @returns {Promise<{ success: boolean, noDm?: boolean }>}
   */
  static async ban(client, guild, moderator, target, reason) {
    const { cleaned } = validateReason(reason);

    // Coba kirim DM sebelum memblokir
    const noDm = await this._notifyUser(client, guild, target, 'commands.ban.dm', {
      guild: guild.name,
      reason: cleaned,
    });

    // Jalankan pemblokiran
    await target.ban({ reason: cleaned });

    // Catat log audit
    client.db.auditLogs.add(guild.id, 'BAN', moderator.id, target.id, cleaned);

    // Kirim log ke kanal moderasi
    await ModerationLogger.log(client, guild, {
      action: 'Ban',
      target,
      moderator,
      reason: cleaned,
    });

    return { success: true, noDm };
  }

  // ──────────────────────────────────────────────
  //  TENDANG (KICK)
  // ──────────────────────────────────────────────

  /**
   * Tendang (kick) seorang anggota dari server.
   *
   * @param {import('../../core/BotClient.js').default} client
   * @param {import('discord.js').Guild} guild
   * @param {import('discord.js').GuildMember} moderator
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   * @returns {Promise<{ success: boolean, noDm?: boolean }>}
   */
  static async kick(client, guild, moderator, target, reason) {
    const { cleaned } = validateReason(reason);

    const noDm = await this._notifyUser(client, guild, target, 'commands.kick.dm', {
      guild: guild.name,
      reason: cleaned,
    });

    await target.kick(cleaned);

    client.db.auditLogs.add(guild.id, 'KICK', moderator.id, target.id, cleaned);

    await ModerationLogger.log(client, guild, {
      action: 'Kick',
      target,
      moderator,
      reason: cleaned,
    });

    return { success: true, noDm };
  }

  // ──────────────────────────────────────────────
  //  BISUKAN (Timeout)
  // ──────────────────────────────────────────────

  /**
   * Bisukan (timeout) seorang anggota.
   *
   * @param {import('../../core/BotClient.js').default} client
   * @param {import('discord.js').Guild} guild
   * @param {import('discord.js').GuildMember} moderator
   * @param {import('discord.js').GuildMember} target
   * @param {number} durationMs - Durasi timeout dalam milidetik
   * @param {string} reason
   * @returns {Promise<{ success: boolean, noDm?: boolean }>}
   */
  static async mute(client, guild, moderator, target, durationMs, reason) {
    const { cleaned } = validateReason(reason);
    const durationStr = formatDuration(durationMs);

    const noDm = await this._notifyUser(client, guild, target, 'commands.mute.dm', {
      guild: guild.name,
      duration: durationStr,
      reason: cleaned,
    });

    await target.timeout(durationMs, cleaned);

    client.db.auditLogs.add(guild.id, 'MUTE', moderator.id, target.id, cleaned, {
      duration: durationMs,
    });

    await ModerationLogger.log(client, guild, {
      action: 'Mute',
      target,
      moderator,
      reason: cleaned,
      duration: durationStr,
    });

    return { success: true, noDm };
  }

  // ──────────────────────────────────────────────
  //  PERINGATAN (WARN)
  // ──────────────────────────────────────────────

  /**
   * Beri peringatan kepada anggota dan periksa eskalasi otomatis.
   *
   * @param {import('../../core/BotClient.js').default} client
   * @param {import('discord.js').Guild} guild
   * @param {import('discord.js').GuildMember} moderator
   * @param {import('discord.js').GuildMember} target
   * @param {string} reason
   * @returns {Promise<{ success: boolean, count: number, escalation?: { action: string, count: number }, noDm?: boolean }>}
   */
  static async warn(client, guild, moderator, target, reason) {
    const { cleaned } = validateReason(reason);

    // Tambahkan peringatan ke database — mengembalikan jumlah total baru
    const count = client.db.warnings.add(guild.id, target.id, moderator.id, cleaned);

    const noDm = await this._notifyUser(client, guild, target, 'commands.warn.dm', {
      guild: guild.name,
      reason: cleaned,
      count,
    });

    client.db.auditLogs.add(guild.id, 'WARN', moderator.id, target.id, cleaned, {
      warningCount: count,
    });

    await ModerationLogger.log(client, guild, {
      action: 'Warn',
      target,
      moderator,
      reason: cleaned,
    });

    // Periksa eskalasi otomatis
    const escalation = await this._checkEscalation(client, guild, moderator, target, count);

    return { success: true, count, escalation, noDm };
  }

  // ──────────────────────────────────────────────
  //  FUNGSI PEMBANTU PRIVAT
  // ──────────────────────────────────────────────

  /**
   * Mencoba mengirim DM ke pengguna sebelum tindakan moderasi.
   * Mengembalikan true jika DM TIDAK dapat dikirim.
   *
   * @param {import('../../core/BotClient.js').default} client
   * @param {import('discord.js').Guild} guild
   * @param {import('discord.js').GuildMember} target
   * @param {string} i18nKey
   * @param {object} vars
   * @returns {Promise<boolean>} true jika DM gagal
   * @private
   */
  static async _notifyUser(client, guild, target, i18nKey, vars) {
    try {
      const message = t(client, guild.id, i18nKey, vars);
      await target.send(message);
      return false;
    } catch {
      // Pengguna menonaktifkan DM atau bot diblokir
      return true;
    }
  }

  /**
   * Periksa apakah jumlah peringatan memicu eskalasi otomatis.
   * Membaca konfigurasi dari JSON guild_settings.warn_escalation,
   * menggunakan EscalationDefaults sebagai cadangan.
   *
   * @param {import('../../core/BotClient.js').default} client
   * @param {import('discord.js').Guild} guild
   * @param {import('discord.js').GuildMember} moderator
   * @param {import('discord.js').GuildMember} target
   * @param {number} count
   * @returns {Promise<{ action: string, count: number }|null>}
   * @private
   */
  static async _checkEscalation(client, guild, moderator, target, count) {
    try {
      const settings = client.db.guildSettings.get(guild.id);
      let escalationMap = parseEscalationMap(settings?.warn_escalation);

      // Parsing pengaturan eskalasi khusus server
      if (settings?.warn_escalation) {
        try {
          escalationMap = JSON.parse(settings.warn_escalation);
        } catch {
          // JSON tidak valid — gunakan pengaturan bawaan
        }
      }

      const action = escalationMap[count];
      if (!action) return null;

      // Jalankan tindakan eskalasi
      switch (action) {
        case 'mute': {
          const ONE_HOUR = 60 * 60 * 1000;
          await this.mute(client, guild, guild.members.me, target, ONE_HOUR, `Auto-escalation: ${count} warnings`);
          break;
        }
        case 'kick':
          await this.kick(client, guild, guild.members.me, target, `Auto-escalation: ${count} warnings`);
          break;
        case 'ban':
          await this.ban(client, guild, guild.members.me, target, `Auto-escalation: ${count} warnings`);
          break;
        default:
          logger.warn(`Unknown escalation action "${action}" for count ${count}`);
          return null;
      }

      return { action, count };
    } catch (error) {
      logger.error('Warn escalation failed:', error);
      return null;
    }
  }
}
