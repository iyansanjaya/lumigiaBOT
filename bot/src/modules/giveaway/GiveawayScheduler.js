/**
 * LumigiaBOT — Giveaway Scheduler
 * Memeriksa giveaway yang sudah expired secara periodik dan mengakhirinya otomatis.
 */

import GiveawayService from './GiveawayService.js';
import { logger } from '../../utils/Logger.js';

/** Interval pengecekan dalam milidetik (30 detik) */
const CHECK_INTERVAL_MS = 30_000;

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
      logger.warn('GiveawayScheduler is already running.');
      return;
    }

    // Jalankan pengecekan pertama segera
    this.checkExpired();

    this.interval = setInterval(() => this.checkExpired(), CHECK_INTERVAL_MS);
    logger.info(`GiveawayScheduler started (interval: ${CHECK_INTERVAL_MS / 1000}s)`);
  }

  /**
   * Hentikan scheduler.
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      logger.info('GiveawayScheduler stopped.');
    }
  }

  /**
   * Periksa giveaway yang sudah expired dan akhiri masing-masing.
   */
  async checkExpired() {
    try {
      const expired = this.client.db.giveaways.getExpired();

      if (expired.length === 0) return;

      logger.info(`Found ${expired.length} expired giveaway(s) to end.`);

      for (const giveaway of expired) {
        try {
          await GiveawayService.endGiveaway(this.client, giveaway);
        } catch (error) {
          logger.error(`Failed to auto-end giveaway #${giveaway.id}:`, error);
        }
      }
    } catch (error) {
      logger.error('GiveawayScheduler.checkExpired error:', error);
    }
  }
}
