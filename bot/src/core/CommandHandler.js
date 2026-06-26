/**
 * LumigiaBOT — Handler Perintah
 * Memuat secara dinamis semua slash command dari pohon direktori commands/.
 */

import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logger } from '../utils/Logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMMANDS_DIR = join(__dirname, '..', 'commands');

/**
 * Memuat secara rekursif semua file .js dari direktori commands
 * dan mendaftarkannya pada koleksi client.commands.
 *
 * @param {import('./BotClient.js').default} client
 */
export async function loadCommands(client) {
  let loaded = 0;

  const categories = await readdir(COMMANDS_DIR, { withFileTypes: true });

  for (const category of categories) {
    if (!category.isDirectory()) continue;

    const categoryPath = join(COMMANDS_DIR, category.name);
    const files = await readdir(categoryPath, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.js')) continue;

      const filePath = join(categoryPath, file.name);

      try {
        const command = await import(`file://${filePath}`);

        if (!command.data || !command.execute) {
          logger.warn(`Command ${file.name} is missing "data" or "execute" export — skipped.`);
          continue;
        }

        // Bungkus modul dalam objek baru karena ES module bersifat frozen
        const cmd = {
          data: command.data,
          execute: command.execute,
          category: category.name,
        };

        client.commands.set(cmd.data.name, cmd);
        loaded++;
      } catch (error) {
        logger.error(`Failed to load command ${file.name}:`, error);
      }
    }
  }

  logger.info(`Loaded ${loaded} commands.`);
}
