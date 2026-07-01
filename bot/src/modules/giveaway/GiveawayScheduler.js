/**
 * LumigiaBOT — Giveaway Scheduler
 * Memeriksa giveaway yang sudah expired secara periodik dan mengakhirinya otomatis.
 */

import GiveawayService from './GiveawayService.js';
import { createServiceLogger } from '../../utils/Logger.js';

/** Interval pengecekan dalam milidetik (30 detik) */
const CHECK_INTERVAL_MS = 30_000;
const log = createServiceLogger('giveaway-scheduler');

export default class GiveawayScheduler {
  /**
   * @param {import('../../core/BotClient.js').default} client
   */
  constructor(client) {
    /** @type {import('../../core/BotClient.js').default} */
    this.client = client;

    /** @type {NodeJS.Timeout|null} */
    this.interval = null;
  }

  /**
   * Mulai scheduler — periksa giveaway expired setiap 30 detik.
   */
  start() {
    if (this.interval) {
      log.warn('start_skipped', { reason: 'already_running' });
      return;
    }

    // Jalankan pengecekan pertama segera
    this.checkExpired();

    this.interval = setInterval(() => this.checkExpired(), CHECK_INTERVAL_MS);
    log.info('started', { intervalMs: CHECK_INTERVAL_MS });
  }

  /**
   * Hentikan scheduler.
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      log.info('stopped');
    }
  }

  /**
   * Periksa giveaway yang sudah expired dan akhiri masing-masing.
   */
  async checkExpired() {
    try {
      const expired = this.client.db.giveaways.getExpired();

      if (expired.length === 0) return;

      log.info('expired_found', { count: expired.length });

      for (const giveaway of expired) {
        try {
          await GiveawayService.endGiveaway(this.client, giveaway);
        } catch (error) {
          log.error('auto_end_failed', {
            guildId: giveaway.guild_id,
            giveawayId: giveaway.id,
            channelId: giveaway.channel_id,
          }, error);
        }
      }
    } catch (error) {
      log.error('check_expired_failed', {}, error);
    }
  }
}
