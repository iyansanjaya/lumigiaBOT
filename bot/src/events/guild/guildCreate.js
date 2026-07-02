/**
 * LumigiaBOT - Event Bergabung Guild
 * Dijalankan saat bot bergabung ke server baru.
 */

import { createServiceLogger } from '../../utils/Logger.js';

export const name = 'guildCreate';
export const once = false;

const serviceLog = createServiceLogger('guild-lifecycle');

export async function execute(guild, client) {
  serviceLog.info('guild_joined', {
    guildId: guild.id,
    guildName: guild.name,
    memberCount: guild.memberCount,
  });

  if (client.db) {
    client.db.guildSettings.ensureExists(guild.id);
    serviceLog.info('guild_settings_initialized', { guildId: guild.id });
  }
}
