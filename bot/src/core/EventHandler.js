/**
 * LumigiaBOT — Handler Event
 * Memuat secara dinamis semua event listener dari pohon direktori events/.
 */

import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logger } from '../utils/Logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EVENTS_DIR = join(__dirname, '..', 'events');

/**
 * Memuat secara rekursif semua file event listener dan memasangnya ke client.
 * Setiap file event harus mengekspor: name (nama event), once (boolean), dan execute (fungsi).
 *
 * @param {import('./BotClient.js').default} client
 */
export async function loadEvents(client) {
  let loaded = 0;

  const categories = await readdir(EVENTS_DIR, { withFileTypes: true });

  for (const category of categories) {
    if (!category.isDirectory()) continue;

    const categoryPath = join(EVENTS_DIR, category.name);
    const files = await readdir(categoryPath, { withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.js')) continue;

      const filePath = join(categoryPath, file.name);

      try {
        const event = await import(`file://${filePath}`);

        if (!event.name || !event.execute) {
          logger.warn(`Event ${file.name} is missing "name" or "execute" export — skipped.`);
          continue;
        }

        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args, client));
        } else {
          client.on(event.name, (...args) => event.execute(...args, client));
        }

        loaded++;
      } catch (error) {
        logger.error(`Failed to load event ${file.name}:`, error);
      }
    }
  }

  logger.info(`Loaded ${loaded} events.`);
}
