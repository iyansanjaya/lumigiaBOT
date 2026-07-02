/**
 * LumigiaBOT — Giveaway Service
 * Mengelola logika inti giveaway: pembuatan, pengakhiran, reroll, embed & tombol.
 */

import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { createServiceLogger } from '../../utils/Logger.js';

/** Warna embed giveaway */
const COLORS = {
  ACTIVE: 0xFF6B6B,
  ENDED: 0x43B581,
  ERROR: 0xF04747,
  INFO: 0x5865F2,
};
const log = createServiceLogger('giveaway-service');

export default class GiveawayService {
  /**
   * Membuat giveaway baru: simpan ke DB, kirim embed + tombol ke channel.
   * @param {import('../../core/BotClient.js').default} client
   * @param {import('discord.js').ChatInputCommandInteraction} interaction
   * @param {object} options
   * @param {string} options.prize - Hadiah giveaway
   * @param {number} options.winnersCount - Jumlah pemenang
   * @param {number} options.duration - Durasi dalam milidetik
   * @param {string|null} options.requiredRole - Role ID yang dibutuhkan (opsional)
   * @param {import('discord.js').TextChannel} options.channel - Channel target
   * @returns {object} Objek giveaway dari database
   */
  static async createGiveaway(client, interaction, { prize, winnersCount, duration, requiredRole, channel }) {
    const endsAt = new Date(Date.now() + duration).toISOString();

    // Simpan ke database
    const giveawayId = client.db.giveaways.create(
      interaction.guildId,
      channel.id,
      prize,
      winnersCount,
      requiredRole,
      interaction.user.id,
      endsAt,
    );

    const giveaway = client.db.giveaways.get(giveawayId);

    // Bangun embed dan tombol
    const embed = GiveawayService.buildGiveawayEmbed(giveaway, 0, false, []);
    const button = GiveawayService.buildEntryButton(giveawayId, 0);
    const row = new ActionRowBuilder().addComponents(button);

    // Kirim ke channel
    const message = await channel.send({ embeds: [embed], components: [row] });

    // Simpan message_id untuk referensi nanti
    client.db.giveaways.setMessageId(giveawayId, message.id);

    log.info('created', {
      guildId: interaction.guildId,
      giveawayId,
      channelId: channel.id,
      hostId: interaction.user.id,
      winnersCount,
      durationMs: duration,
      requiredRole,
    });

    return client.db.giveaways.get(giveawayId);
  }

  /**
   * Akhiri giveaway: pilih pemenang acak, update embed, tandai selesai.
   * @param {import('../../core/BotClient.js').default} client
   * @param {object} giveaway - Objek giveaway dari database
   */
  static async endGiveaway(client, giveaway) {
    const entries = client.db.giveaways.getEntries(giveaway.id);
    const winnersCount = Math.min(giveaway.winners_count, entries.length);

    let winners = [];
    if (entries.length > 0) {
      // Fisher-Yates shuffle lalu ambil sejumlah pemenang
      const shuffled = [...entries];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      winners = shuffled.slice(0, winnersCount);
    }

    // Update database
    client.db.giveaways.end(giveaway.id, winners);

    // Update embed di channel
    await GiveawayService._updateGiveawayMessage(client, giveaway, entries.length, true, winners);

    // Kirim pengumuman pemenang di channel
    try {
      const channel = await client.channels.fetch(giveaway.channel_id);
      if (channel) {
        if (winners.length > 0) {
          const winnerMentions = winners.map(id => `<@${id}>`).join(', ');
          await channel.send(
            `🎉 Congratulations ${winnerMentions}! You won **${giveaway.prize}**!\n` +
            `> Giveaway ID: \`#${giveaway.id}\``,
          );
        } else {
          await channel.send(
            `😔 Giveaway for **${giveaway.prize}** ended with no participants.\n` +
            `> Giveaway ID: \`#${giveaway.id}\``,
          );
        }
      }
    } catch (error) {
      log.error('winner_announcement_failed', {
        guildId: giveaway.guild_id,
        giveawayId: giveaway.id,
        channelId: giveaway.channel_id,
        entries: entries.length,
        winners: winners.length,
      }, error);
    }

    log.info('ended', {
      guildId: giveaway.guild_id,
      giveawayId: giveaway.id,
      channelId: giveaway.channel_id,
      entries: entries.length,
      winners: winners.length,
    });
  }

  /**
   * Reroll: pilih pemenang baru secara acak.
   * @param {import('../../core/BotClient.js').default} client
   * @param {object} giveaway - Objek giveaway dari database
   */
  static async rerollGiveaway(client, giveaway) {
    const entries = client.db.giveaways.getEntries(giveaway.id);
    const winnersCount = Math.min(giveaway.winners_count, entries.length);

    let winners = [];
    if (entries.length > 0) {
      const shuffled = [...entries];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      winners = shuffled.slice(0, winnersCount);
    }

    // Update database
    client.db.giveaways.end(giveaway.id, winners);

    // Update embed
    await GiveawayService._updateGiveawayMessage(client, giveaway, entries.length, true, winners);

    // Kirim pengumuman reroll
    try {
      const channel = await client.channels.fetch(giveaway.channel_id);
      if (channel && winners.length > 0) {
        const winnerMentions = winners.map(id => `<@${id}>`).join(', ');
        await channel.send(
          `🔄 Giveaway rerolled! New winner(s): ${winnerMentions} for **${giveaway.prize}**!\n` +
          `> Giveaway ID: \`#${giveaway.id}\``,
        );
      }
    } catch (error) {
      log.error('reroll_announcement_failed', {
        guildId: giveaway.guild_id,
        giveawayId: giveaway.id,
        channelId: giveaway.channel_id,
        entries: entries.length,
        winners: winners.length,
      }, error);
    }

    log.info('rerolled', {
      guildId: giveaway.guild_id,
      giveawayId: giveaway.id,
      channelId: giveaway.channel_id,
      entries: entries.length,
      winners: winners.length,
    });
  }

  /**
   * Bangun embed giveaway.
   * @param {object} giveaway - Objek giveaway dari database
   * @param {number} entriesCount - Jumlah peserta
   * @param {boolean} isEnded - Apakah giveaway sudah selesai
   * @param {string[]} winners - Array user ID pemenang
   * @returns {EmbedBuilder}
   */
  static buildGiveawayEmbed(giveaway, entriesCount, isEnded, winners) {
    const embed = new EmbedBuilder()
      .setTitle('🎉 GIVEAWAY 🎉')
      .setColor(isEnded ? COLORS.ENDED : COLORS.ACTIVE)
      .setTimestamp()
      .setFooter({ text: `Giveaway ID: #${giveaway.id} • LumigiaBOT` });

    // Deskripsi utama
    const lines = [`**${giveaway.prize}**`, ''];

    if (isEnded) {
      if (winners.length > 0) {
        const winnerMentions = winners.map(id => `<@${id}>`).join('\n');
        lines.push(`🏆 **Winner(s):**\n${winnerMentions}`);
      } else {
        lines.push('😔 **No participants**');
      }
      lines.push('', '⏰ Giveaway has ended!');
    } else {
      const endsAtUnix = Math.floor(new Date(giveaway.ends_at).getTime() / 1000);
      lines.push(`⏰ Ends: <t:${endsAtUnix}:R> (<t:${endsAtUnix}:F>)`);
      lines.push(`🎟️ Entries: **${entriesCount}**`);
      lines.push(`🏆 Winners: **${giveaway.winners_count}**`);
    }

    lines.push(`👤 Hosted by: <@${giveaway.host_id}>`);

    if (giveaway.required_role) {
      lines.push(`🔒 Required role: <@&${giveaway.required_role}>`);
    }

    embed.setDescription(lines.join('\n'));

    return embed;
  }

  /**
   * Bangun tombol entri giveaway.
   * @param {number} giveawayId - ID giveaway
   * @param {number} entriesCount - Jumlah peserta saat ini
   * @returns {ButtonBuilder}
   */
  static buildEntryButton(giveawayId, entriesCount) {
    return new ButtonBuilder()
      .setCustomId(`giveaway_enter_${giveawayId}`)
      .setLabel(`Enter (${entriesCount})`)
      .setEmoji('🎉')
      .setStyle(ButtonStyle.Primary);
  }

  /**
   * Update pesan giveaway di channel (embed + tombol).
   * @param {import('../../core/BotClient.js').default} client
   * @param {object} giveaway - Objek giveaway dari database
   * @param {number} entriesCount - Jumlah peserta
   * @param {boolean} isEnded - Apakah giveaway sudah selesai
   * @param {string[]} winners - Array user ID pemenang
   * @private
   */
  static async _updateGiveawayMessage(client, giveaway, entriesCount, isEnded, winners) {
    try {
      const channel = await client.channels.fetch(giveaway.channel_id).catch(() => null);
      if (!channel) {
        log.warn('message_update_skipped', {
          guildId: giveaway.guild_id,
          giveawayId: giveaway.id,
          channelId: giveaway.channel_id,
          reason: 'channel_missing',
        });
        return;
      }

      const message = await channel.messages.fetch(giveaway.message_id).catch(() => null);
      if (!message) {
        log.warn('message_update_skipped', {
          guildId: giveaway.guild_id,
          giveawayId: giveaway.id,
          channelId: giveaway.channel_id,
          messageId: giveaway.message_id,
          reason: 'message_missing',
        });
        return;
      }

      const embed = GiveawayService.buildGiveawayEmbed(giveaway, entriesCount, isEnded, winners);

      if (isEnded) {
        // Nonaktifkan tombol saat giveaway selesai
        const disabledButton = new ButtonBuilder()
          .setCustomId(`giveaway_enter_${giveaway.id}`)
          .setLabel('Giveaway Ended')
          .setEmoji('🎉')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true);

        const row = new ActionRowBuilder().addComponents(disabledButton);
        await message.edit({ embeds: [embed], components: [row] });
      } else {
        const button = GiveawayService.buildEntryButton(giveaway.id, entriesCount);
        const row = new ActionRowBuilder().addComponents(button);
        await message.edit({ embeds: [embed], components: [row] });
      }
    } catch (error) {
      log.error('message_update_failed', {
        guildId: giveaway.guild_id,
        giveawayId: giveaway.id,
        channelId: giveaway.channel_id,
        messageId: giveaway.message_id,
      }, error);
    }
  }
}
