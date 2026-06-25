/**
 * LumigiaBOT — Handler Komponen
 * Memuat secara dinamis handler tombol, modal, dan select menu
 * dari pohon direktori components/.
 */

import { readdir } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logger } from '../utils/Logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COMPONENTS_DIR = join(__dirname, '..', 'components');

/** Peta nama subdirektori ke nama koleksi client */
const COMPONENT_TYPES = {
  buttons: 'buttons',
  modals: 'modals',
  selectMenus: 'selectMenus',
};

/**
 * Memuat semua handler interaksi komponen dan mendaftarkannya
 * pada koleksi client yang sesuai.
 *
 * Setiap file komponen harus mengekspor: customId (string) dan execute (fungsi).
 *
 * @param {import('./BotClient.js').default} client
 */
export async function loadComponents(client) {
  let loaded = 0;

  for (const [dirName, collectionName] of Object.entries(COMPONENT_TYPES)) {
    const dirPath = join(COMPONENTS_DIR, dirName);

    let files;
    try {
      files = await readdir(dirPath, { withFileTypes: true });
    } catch {
      // Direktori belum ada — lewati tanpa pesan
      continue;
    }

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.js')) continue;

      const filePath = join(dirPath, file.name);

      try {
        const component = await import(`file://${filePath}`);

        if (!component.customId || !component.execute) {
          logger.warn(`Component ${file.name} is missing "customId" or "execute" — skipped.`);
          continue;
        }

        client[collectionName].set(component.customId, component);
        loaded++;
      } catch (error) {
        logger.error(`Failed to load component ${file.name}:`, error);
      }
    }
  }

  logger.info(`Loaded ${loaded} components.`);
}
