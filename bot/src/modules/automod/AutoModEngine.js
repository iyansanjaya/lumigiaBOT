/**
 * LumigiaBOT — Mesin AutoMod
 * Pipeline pemrosesan pesan utama untuk moderasi otomatis.
 *
 * Alur:
 * 1. Periksa apakah automod memiliki filter yang diaktifkan untuk server
 * 2. Periksa daftar putih (pengecualian peran & kanal)
 * 3. Jalankan semua filter yang diaktifkan secara berurutan
 * 4. Jika filter terpicu, jalankan tindakan yang dikonfigurasi
 * 5. Catat pelanggaran ke automod_log_channel
 */

import { createEmbed } from '../../utils/EmbedBuilder.js';
import { t } from '../../i18n/helpers.js';
import { createServiceLogger } from '../../utils/Logger.js';

// Impor semua filter
import SpamFilter from './filters/SpamFilter.js';
import LinkFilter from './filters/LinkFilter.js';
import WordFilter from './filters/WordFilter.js';
import CapsFilter from './filters/CapsFilter.js';
import EmojiFilter from './filters/EmojiFilter.js';
import MentionFilter from './filters/MentionFilter.js';

// Impor semua tindakan
import DeleteAction from './actions/DeleteAction.js';
import WarnAction from './actions/WarnAction.js';
import MuteAction from './actions/MuteAction.js';
import KickAction from './actions/KickAction.js';
import BanAction from './actions/BanAction.js';

const log = createServiceLogger('automod');

export default class AutoModEngine {
  /**
   * @param {import('../../core/BotClient.js').default} client
   */
  constructor(client) {
    this.client = client;

    // Inisialisasi filter
    /** @type {Map<string, object>} */
    this.filters = new Map([
      ['spam', new SpamFilter()],
      ['link', new LinkFilter()],
      ['word', new WordFilter()],
      ['caps', new CapsFilter()],
      ['emoji', new EmojiFilter()],
      ['mention', new MentionFilter()],
    ]);

    // Inisialisasi tindakan
    /** @type {Map<string, object>} */
    this.actions = new Map([
      ['delete', new DeleteAction()],
      ['warn', new WarnAction()],
      ['mute', new MuteAction()],
      ['kick', new KickAction()],
      ['ban', new BanAction()],
    ]);
  }

  /**
   * Proses sebuah pesan melalui semua filter automod yang diaktifkan.
   *
   * @param {import('discord.js').Message} message
   */
  async process(message) {
    // Pemeriksaan keamanan
    if (!message.guild || message.author.bot) return;

    try {
      // 1. Dapatkan semua filter yang diaktifkan untuk server ini
      const filterConfigs = this.client.db.automod.getAllFilters(message.guild.id);
      const enabledFilters = filterConfigs.filter((f) => f.enabled);

      if (enabledFilters.length === 0) return;

      // 2. Periksa pengecualian daftar putih
      if (await this._isWhitelisted(message)) return;

      // 3. Jalankan setiap filter yang diaktifkan
      for (const filterConfig of enabledFilters) {
        const filter = this.filters.get(filterConfig.filter_name);
        if (!filter) continue;

        // Parsing konfigurasi per-server
        let config = {};
        try {
          config = JSON.parse(filterConfig.config || '{}');
        } catch {
          // Gunakan konfigurasi kosong jika parsing gagal
        }

        // Jalankan pemeriksaan filter (WordFilter membutuhkan client sebagai argumen ke-3)
        const result = filter.check(message, config, this.client);

        if (result.triggered) {
          // 4. Jalankan tindakan yang dikonfigurasi
          const action = this.actions.get(filterConfig.action || 'delete');
          if (action) {
            await action.execute(message, this.client, { reason: result.reason, ...config });
          } else {
            log.warn('unknown_action', {
              guildId: message.guild.id,
              channelId: message.channel.id,
              messageId: message.id,
              filter: filterConfig.filter_name,
              action: filterConfig.action,
            });
          }

          // 5. Catat pelanggaran
          await this._logViolation(message, filterConfig.filter_name, result.reason, filterConfig.action);
          log.info('filter_triggered', {
            guildId: message.guild.id,
            channelId: message.channel.id,
            messageId: message.id,
            userId: message.author.id,
            filter: filterConfig.filter_name,
            action: filterConfig.action,
          });

          // Hentikan pemrosesan setelah pemicu pertama (satu tindakan per pesan)
          break;
        }
      }
    } catch (error) {
      log.error('process_failed', {
        guildId: message.guild?.id,
        channelId: message.channel?.id,
        messageId: message.id,
        userId: message.author?.id,
      }, error);
    }
  }

  /**
   * Periksa apakah sebuah pesan dikecualikan dari automod melalui daftar putih.
   *
   * @param {import('discord.js').Message} message
   * @returns {Promise<boolean>}
   * @private
   */
  async _isWhitelisted(message) {
    try {
      const whitelist = this.client.db.automod.getWhitelist(message.guild.id);
      if (!whitelist || whitelist.length === 0) return false;

      for (const entry of whitelist) {
        // Daftar putih kanal
        if (entry.type === 'channel' && entry.target_id === message.channel.id) {
          return true;
        }

        // Daftar putih peran — periksa apakah anggota memiliki peran yang masuk daftar putih
        if (entry.type === 'role' && message.member?.roles.cache.has(entry.target_id)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      log.error('whitelist_check_failed', {
        guildId: message.guild?.id,
        channelId: message.channel?.id,
        messageId: message.id,
      }, error);
      return false;
    }
  }

  /**
   * Catat pelanggaran automod ke automod_log_channel server.
   *
   * @param {import('discord.js').Message} message
   * @param {string} filterName
   * @param {string} reason
   * @param {string} action
   * @private
   */
  async _logViolation(message, filterName, reason, action) {
    try {
      const settings = this.client.db.guildSettings.get(message.guild.id);
      if (!settings?.automod_log_channel) return;

      const channel = await message.guild.channels.fetch(settings.automod_log_channel).catch(() => null);
      if (!channel) return;

      // Petakan nama filter ke kunci i18n
      const i18nKeyMap = {
        spam: 'automod.spam_detected',
        link: 'automod.link_blocked',
        word: 'automod.word_blocked',
        caps: 'automod.caps_blocked',
        emoji: 'automod.emoji_blocked',
        mention: 'automod.mention_blocked',
      };

      const title = t(this.client, message.guild.id, i18nKeyMap[filterName] ?? 'automod.spam_detected', {
        user: message.author.tag,
      });

      const actionText = t(this.client, message.guild.id, 'automod.action_taken', { action });

      const embed = createEmbed('automod')
        .setTitle(`🛡️ AutoMod — ${filterName}`)
        .setDescription(`${title}\n${actionText}`)
        .addFields(
          { name: 'User', value: `${message.author} (${message.author.id})`, inline: true },
          { name: 'Channel', value: `${message.channel}`, inline: true },
          { name: 'Reason', value: reason || 'N/A' },
        );

      // Sertakan cuplikan konten pesan jika tersedia
      if (message.content) {
        const snippet = message.content.length > 200
          ? `${message.content.slice(0, 200)}…`
          : message.content;
        embed.addFields({ name: 'Content', value: `\`\`\`${snippet}\`\`\`` });
      }

      await channel.send({ embeds: [embed] });
    } catch (error) {
      log.error('violation_log_failed', {
        guildId: message.guild?.id,
        channelId: message.channel?.id,
        messageId: message.id,
        filter: filterName,
        action,
      }, error);
    }
  }
}
