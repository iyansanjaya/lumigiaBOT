/**
 * LumigiaBOT — Event Bergabung Guild
 * Dijalankan saat bot bergabung ke server baru.
 */

import { logger } from '../../utils/Logger.js';

export const name = 'guildCreate';
export const once = false;

export async function execute(guild, client) {
  logger.info(`Joined new guild: ${guild.name} (${guild.id}) — ${guild.memberCount} members`);

  // Inisialisasi pengaturan default untuk guild baru
  if (client.db) {
    client.db.guildSettings.ensureExists(guild.id);
  }
}
