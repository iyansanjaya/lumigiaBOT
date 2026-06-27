/**
 * LumigiaBOT — Leveling Service
 * Mengelola logika inti sistem leveling: perhitungan XP, pemrosesan pesan, level-up, dan embed.
 */

import { EmbedBuilder } from 'discord.js';
import { logger } from '../../utils/Logger.js';

/** Warna embed leveling */
const COLORS = {
  SUCCESS: 0x43B581,
  ERROR: 0xF04747,
  INFO: 0x5865F2,
  LEVELUP: 0xFFD700,
};

export class LevelingService {
  /**
   * Menghitung level berdasarkan jumlah XP.
   * Formula: floor(0.1 * sqrt(xp))
   * @param {number} xp - Total XP user
   * @returns {number} Level number
   */
  static calculateLevel(xp) {
    if (xp <= 0) return 0;
    return Math.floor(0.1 * Math.sqrt(xp));
  }

  /**
   * Menghitung XP yang dibutuhkan untuk mencapai level tertentu.
   * Inverse formula: ceil((level / 0.1) ** 2)
   * @param {number} level - Target level
   * @returns {number} XP yang dibutuhkan
   */
  static xpForLevel(level) {
    if (level <= 0) return 0;
    return Math.ceil((level / 0.1) ** 2);
  }

  /**
   * Menghitung XP yang dibutuhkan untuk naik ke level berikutnya.
   * @param {number} currentLevel - Level saat ini
   * @returns {number} XP yang dibutuhkan untuk level berikutnya
   */
  static xpForNextLevel(currentLevel) {
    return LevelingService.xpForLevel(currentLevel + 1);
  }

  /**
   * Memproses pesan untuk memberikan XP ke user.
   * Termasuk pengecekan: enabled, bot, cooldown, channel/role ignore, multiplier.
   * @param {import('../../core/BotClient.js').default} client
   * @param {import('discord.js').Message} message
   */
  static async processMessage(client, message) {
    // Abaikan bot dan pesan sistem
    if (message.author.bot || message.system) return;
    if (!message.guild) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    // 1. Cek apakah leveling aktif untuk guild ini
    const settings = client.db.leveling.getSettings(guildId);
    if (!settings || !settings.enabled) return;

    // 2. Cek apakah channel di-ignore
    try {
      const ignoredChannels = JSON.parse(settings.ignored_channels || '[]');
      if (ignoredChannels.includes(message.channel.id)) return;
    } catch {
      // Jika parsing gagal, lanjutkan
    }

    // 3. Cek apakah user punya role yang di-ignore
    try {
      const ignoredRoles = JSON.parse(settings.ignored_roles || '[]');
      if (message.member) {
        const memberRoles = message.member.roles.cache;
        if (ignoredRoles.some((roleId) => memberRoles.has(roleId))) return;
      }
    } catch {
      // Jika parsing gagal, lanjutkan
    }

    // 4. Cek cooldown
    const userData = client.db.leveling.getUser(guildId, userId);
    if (userData?.last_xp_at) {
      const lastXpTime = new Date(userData.last_xp_at + 'Z').getTime();
      const cooldownMs = (settings.xp_cooldown ?? 60) * 1000;
      if (Date.now() - lastXpTime < cooldownMs) return;
    }

    // 5. Hitung multiplier (cek apakah expired)
    let multiplier = settings.multiplier ?? 1.0;
    if (settings.multiplier_expires) {
      const expiresAt = new Date(settings.multiplier_expires + 'Z').getTime();
      if (Date.now() > expiresAt) {
        // Multiplier sudah expired, reset ke 1.0
        client.db.leveling.updateSetting(guildId, 'multiplier', 1.0);
        client.db.leveling.updateSetting(guildId, 'multiplier_expires', null);
        multiplier = 1.0;
      }
    }

    // 6. Generate random XP: 10-25, dikali multiplier
    const baseXP = Math.floor(Math.random() * 16) + 10;
    const xpGained = Math.floor(baseXP * multiplier);

    // 7. Simpan level lama sebelum menambah XP
    const oldLevel = userData ? LevelingService.calculateLevel(userData.xp) : 0;

    // 8. Tambah XP ke database
    client.db.leveling.addXP(guildId, userId, xpGained);

    // 9. Cek level baru
    const updatedUser = client.db.leveling.getUser(guildId, userId);
    if (!updatedUser) return;

    const newLevel = LevelingService.calculateLevel(updatedUser.xp);

    // 10. Jika level naik, handle level-up
    if (newLevel > oldLevel) {
      await LevelingService.handleLevelUp(client, message, oldLevel, newLevel);
    }
  }

  /**
   * Menangani event level-up: update DB, assign role rewards, kirim pesan.
   * @param {import('../../core/BotClient.js').default} client
   * @param {import('discord.js').Message} message
   * @param {number} oldLevel - Level sebelumnya
   * @param {number} newLevel - Level baru
   */
  static async handleLevelUp(client, message, oldLevel, newLevel) {
    const guildId = message.guild.id;
    const userId = message.author.id;

    // 1. Update level di database
    client.db.leveling.setLevel(guildId, userId, newLevel);

    // 2. Cek dan assign role rewards
    try {
      const rewards = client.db.leveling.getRewardsUpTo(guildId, newLevel);
      if (rewards.length > 0 && message.member) {
        for (const reward of rewards) {
          if (!message.member.roles.cache.has(reward.role_id)) {
            const role = message.guild.roles.cache.get(reward.role_id);
            if (role) {
              await message.member.roles.add(role).catch(() => {});
            }
          }
        }
      }
    } catch (error) {
      logger.error('Error assigning role rewards:', error);
    }

    // 3. Bangun embed level-up
    const xpNeeded = LevelingService.xpForNextLevel(newLevel);
    const currentXP = client.db.leveling.getUser(guildId, userId)?.xp ?? 0;
    const currentLevelXP = LevelingService.xpForLevel(newLevel);
    const progressXP = currentXP - currentLevelXP;
    const progressNeeded = xpNeeded - currentLevelXP;
    const progressBar = LevelingService.buildProgressBar(progressXP, progressNeeded, 12);

    const embed = new EmbedBuilder()
      .setColor(COLORS.LEVELUP)
      .setTitle('🎉 Level Up!')
      .setDescription(
        `Congratulations ${message.author}! You've reached **Level ${newLevel}**!`,
      )
      .addFields(
        { name: '📊 Progress', value: `${progressBar}\n${currentXP.toLocaleString()} / ${xpNeeded.toLocaleString()} XP`, inline: false },
      )
      .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setFooter({ text: 'LumigiaBOT • Leveling System' });

    // 4. Kirim ke announce_channel atau channel yang sama
    try {
      const settings = client.db.leveling.getSettings(guildId);
      let targetChannel = message.channel;

      if (settings?.announce_channel) {
        const announceChannel = message.guild.channels.cache.get(settings.announce_channel);
        if (announceChannel) {
          targetChannel = announceChannel;
        }
      }

      await targetChannel.send({ embeds: [embed] });
    } catch (error) {
      logger.error('Error sending level-up message:', error);
    }
  }

  /**
   * Membangun progress bar visual.
   * Contoh: ████████░░░░ 67%
   * @param {number} current - Nilai saat ini
   * @param {number} needed - Nilai yang dibutuhkan
   * @param {number} length - Panjang bar (jumlah karakter)
   * @returns {string} Visual progress bar
   */
  static buildProgressBar(current, needed, length = 12) {
    if (needed <= 0) return '█'.repeat(length) + ' 100%';
    const progress = Math.min(current / needed, 1);
    const filled = Math.round(progress * length);
    const empty = length - filled;
    const percentage = Math.round(progress * 100);
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percentage}%`;
  }

  /**
   * Membangun embed rank card yang kaya informasi.
   * @param {import('discord.js').GuildMember} member - Member Discord
   * @param {object} userData - Data XP dari database
   * @param {number} rank - Posisi rank (1-based)
   * @param {object[]} rewards - Daftar role rewards
   * @returns {EmbedBuilder} Embed rank card
   */
  static buildRankEmbed(member, userData, rank, rewards) {
    const level = LevelingService.calculateLevel(userData.xp);
    const currentLevelXP = LevelingService.xpForLevel(level);
    const nextLevelXP = LevelingService.xpForNextLevel(level);
    const progressXP = userData.xp - currentLevelXP;
    const progressNeeded = nextLevelXP - currentLevelXP;
    const progressBar = LevelingService.buildProgressBar(progressXP, progressNeeded, 16);

    const embed = new EmbedBuilder()
      .setColor(COLORS.INFO)
      .setAuthor({
        name: `${member.displayName}'s Rank Card`,
        iconURL: member.user.displayAvatarURL({ dynamic: true }),
      })
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🏆 Rank', value: `#${rank}`, inline: true },
        { name: '⭐ Level', value: `${level}`, inline: true },
        { name: '✨ Total XP', value: `${userData.xp.toLocaleString()}`, inline: true },
        { name: '💬 Messages', value: `${userData.messages.toLocaleString()}`, inline: true },
        {
          name: '📊 Progress to Next Level',
          value: `${progressBar}\n${progressXP.toLocaleString()} / ${progressNeeded.toLocaleString()} XP`,
        },
      )
      .setTimestamp()
      .setFooter({ text: 'LumigiaBOT • Leveling System' });

    // Tambahkan upcoming rewards jika ada
    if (rewards.length > 0) {
      const nextRewards = rewards
        .filter((r) => r.level > level)
        .slice(0, 3)
        .map((r) => `Level ${r.level} → <@&${r.role_id}>`)
        .join('\n');

      if (nextRewards) {
        embed.addFields({
          name: '🎁 Upcoming Rewards',
          value: nextRewards,
        });
      }
    }

    return embed;
  }
}
