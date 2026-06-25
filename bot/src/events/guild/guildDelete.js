/**
 * LumigiaBOT — Event Meninggalkan Guild
 * Dijalankan saat bot dihapus dari server.
 */

import { logger } from '../../utils/Logger.js';

export const name = 'guildDelete';
export const once = false;

export async function execute(guild, client) {
  logger.info(`Left guild: ${guild.name} (${guild.id})`);

  // Bersihkan data guild
  if (client.db) {
    client.db.guildSettings.delete(guild.id);
  }
}
