/**
 * LumigiaBOT — Penangan Error Global
 * Menangkap error yang tidak tertangani untuk mencegah bot crash.
 */

import { logger } from './Logger.js';

/**
 * Mendaftarkan penangan error global pada proses.
 * Memastikan bot tetap online meskipun terjadi error tak terduga.
 */
export function registerErrorHandlers() {
  process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Promise Rejection:', error);
  });

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    // Beri waktu untuk log sebelum keluar untuk error yang benar-benar fatal
    if (error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
      logger.warn('Network error — bot akan mencoba menyambung ulang.');
      return;
    }
  });

  process.on('warning', (warning) => {
    logger.warn('Process Warning:', warning.message);
  });
}
