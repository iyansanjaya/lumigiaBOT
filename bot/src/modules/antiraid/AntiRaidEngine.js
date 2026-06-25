/**
 * LumigiaBOT — Mesin Anti-Raid
 * Memantau event guildMemberAdd untuk mendeteksi serangan bergabung massal.
 *
 * Fitur:
 * - Melacak timestamp bergabung per guild
 * - Memicu peringatan ketika jumlah bergabung melebihi ambang batas dalam jangka waktu
 * - Memeriksa umur akun baru untuk akun mencurigakan
 * - Mengaktifkan lockdown seluruh server saat serangan terdeteksi
 */

import { AntiRaidDefaults } from '../../config/constants.js';
import { createEmbed } from '../../utils/EmbedBuilder.js';
import { t } from '../../i18n/helpers.js';
import { logger } from '../../utils/Logger.js';
import LockdownManager from './LockdownManager.js';

export default class AntiRaidEngine {
  /**
   * @param {import('../../core/BotClient.js').default} client
   */
  constructor(client) {
    this.client = client;

    /**
     * Timestamp bergabung per guild.
     * @type {Map<string, number[]>}
     */
    this.joinHistory = new Map();
  }

  /**
   * Menangani anggota baru yang bergabung. Dipanggil dari event guildMemberAdd.
   *
   * @param {import('discord.js').GuildMember} member
   */
  async onMemberJoin(member) {
    try {
      const guild = member.guild;

      // 1. Periksa apakah anti-raid diaktifkan
      const settings = this.client.db.guildSettings.get(guild.id);
      if (!settings?.anti_raid_enabled) return;

      const threshold = settings.anti_raid_threshold ?? AntiRaidDefaults.THRESHOLD;
      const timeframe = (settings.anti_raid_timeframe ?? AntiRaidDefaults.TIMEFRAME / 1000) * 1000;

      // 2. Lacak bergabungnya anggota
      const now = Date.now();
      if (!this.joinHistory.has(guild.id)) {
        this.joinHistory.set(guild.id, []);
      }

      const joins = this.joinHistory.get(guild.id);
      joins.push(now);

      // 3. Hapus entri lama di luar jangka waktu
      const recentJoins = joins.filter((ts) => now - ts < timeframe);
      this.joinHistory.set(guild.id, recentJoins);

      // 4. Periksa ambang batas
      if (recentJoins.length >= threshold) {
        await this._triggerAlert(guild, recentJoins.length, Math.round(timeframe / 1000));
        // Bersihkan riwayat untuk mencegah peringatan berulang
        this.joinHistory.set(guild.id, []);
      }

      // 5. Periksa umur akun
      await this._checkAccountAge(member, settings);
    } catch (error) {
      logger.error('AntiRaid processing error:', error);
    }
  }

  /**
   * Memicu peringatan serangan: catat ke channel moderasi dan aktifkan lockdown.
   *
   * @param {import('discord.js').Guild} guild
   * @param {number} count - Jumlah bergabung yang terdeteksi
   * @param {number} seconds - Jangka waktu dalam detik
   * @private
   */
  async _triggerAlert(guild, count, seconds) {
    try {
      logger.warn(`Raid detected in ${guild.name}: ${count} joins in ${seconds}s`);

      // Aktifkan lockdown server
      await LockdownManager.lockAll(guild, 'Anti-raid lockdown');

      // Kirim peringatan ke channel log moderasi
      const settings = this.client.db.guildSettings.get(guild.id);
      if (!settings?.mod_log_channel) return;

      const channel = await guild.channels.fetch(settings.mod_log_channel).catch(() => null);
      if (!channel) return;

      const embed = createEmbed('error')
        .setTitle(t(this.client, guild.id, 'antiraid.alert_title'))
        .setDescription(
          t(this.client, guild.id, 'antiraid.alert_description', { count, seconds }) +
          '\n\n' +
          t(this.client, guild.id, 'antiraid.lockdown_activated'),
        );

      await channel.send({ embeds: [embed] });

      // Catat di log audit
      this.client.db.auditLogs.add(
        guild.id, 'ANTI_RAID', this.client.user.id, null,
        `Raid detected: ${count} joins in ${seconds}s — lockdown activated`,
      );
    } catch (error) {
      logger.error('Failed to trigger raid alert:', error);
    }
  }

  /**
   * Memeriksa apakah umur akun anggota baru mencurigakan karena terlalu muda.
   *
   * @param {import('discord.js').GuildMember} member
   * @param {object} settings - Pengaturan guild
   * @private
   */
  async _checkAccountAge(member, settings) {
    try {
      const minAgeDays = AntiRaidDefaults.MIN_ACCOUNT_AGE;
      const accountAge = Date.now() - member.user.createdTimestamp;
      const accountAgeDays = accountAge / (1000 * 60 * 60 * 24);

      if (accountAgeDays < minAgeDays) {
        // Catat peringatan ke channel moderasi
        if (!settings?.mod_log_channel) return;

        const channel = await member.guild.channels.fetch(settings.mod_log_channel).catch(() => null);
        if (!channel) return;

        const embed = createEmbed('warning')
          .setDescription(
            t(this.client, member.guild.id, 'antiraid.young_account', {
              user: member.user.tag,
              days: minAgeDays,
            }),
          )
          .addFields(
            { name: 'Account Age', value: `${Math.floor(accountAgeDays)} days`, inline: true },
            { name: 'User ID', value: member.id, inline: true },
          );

        await channel.send({ embeds: [embed] });
      }
    } catch (error) {
      logger.error('Account age check failed:', error);
    }
  }
}
