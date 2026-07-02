/**
 * LumigiaBOT - Event Meninggalkan Guild
 * Dijalankan saat bot dihapus dari server.
 */

import { existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { getDataDir } from '../../config/env.js';
import { createServiceLogger } from '../../utils/Logger.js';

export const name = 'guildDelete';
export const once = false;

const serviceLog = createServiceLogger('guild-lifecycle');

function removeTranscriptDir(guildId) {
  const transcriptDir = join(getDataDir(), 'transcripts', guildId);
  const existed = existsSync(transcriptDir);

  rmSync(transcriptDir, { recursive: true, force: true });
  return existed;
}

export async function execute(guild, client) {
  serviceLog.info('guild_left', {
    guildId: guild.id,
    guildName: guild.name,
  });

  let cleanupResult = { totalDeletedRows: 0 };
  if (client.db) {
    cleanupResult = client.db.deleteGuildData(guild.id);
  }

  const transcriptDirDeleted = removeTranscriptDir(guild.id);

  serviceLog.info('guild_data_deleted', {
    guildId: guild.id,
    deletedRows: cleanupResult.totalDeletedRows,
    transcriptDirDeleted,
  });
}
