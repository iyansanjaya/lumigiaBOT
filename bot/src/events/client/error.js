/**
 * LumigiaBOT — Event Error
 * Menangani error client Discord.
 */

import { logger } from '../../utils/Logger.js';

export const name = 'error';
export const once = false;

export async function execute(error) {
  logger.error('Discord client error:', error);
}
