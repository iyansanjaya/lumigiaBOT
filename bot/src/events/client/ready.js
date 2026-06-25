/**
 * LumigiaBOT — Event Ready
 * Dijalankan sekali saat bot berhasil terhubung ke Discord.
 */

import { ActivityType } from 'discord.js';
import { logger } from '../../utils/Logger.js';

export const name = 'ready';
export const once = true;

export async function execute(client) {
  logger.info(`✅ ${client.user.tag} online! Melayani ${client.guilds.cache.size} server.`);

  // Atur aktivitas bot
  client.user.setActivity('your server 🛡️', { type: ActivityType.Watching });
}
