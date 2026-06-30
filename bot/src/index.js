/**
 * LumigiaBOT — Titik Masuk
 * Menginisialisasi semua sistem dan menghubungkan ke Discord.
 */

import 'dotenv/config';
import BotClient from './core/BotClient.js';
import { loadCommands } from './core/CommandHandler.js';
import { loadEvents } from './core/EventHandler.js';
import { loadComponents } from './core/ComponentHandler.js';
import { initI18n } from './i18n/index.js';
import Database from './database/Database.js';
import { validateBotEnv } from './config/env.js';
import { registerErrorHandlers } from './utils/ErrorHandler.js';
import { logger } from './utils/Logger.js';

async function main() {
  // 1. Daftarkan penangan error global terlebih dahulu
  registerErrorHandlers();

  // 2. Validasi konfigurasi runtime sebelum sistem lain dimulai
  const env = validateBotEnv();

  // 3. Buat instance client
  const client = new BotClient();

  // 4. Inisialisasi i18n
  await initI18n();
  logger.info('i18n terinisialisasi.');

  // 5. Hubungkan database
  client.db = new Database(env.databasePath);

  // 6. Muat perintah, event, dan komponen
  await loadCommands(client);
  await loadEvents(client);
  await loadComponents(client);

  // 7. Hubungkan ke Discord
  await client.login(env.discordToken);

  // 8. Shutdown yang baik
  const shutdown = () => {
    logger.info('Mematikan...');
    client.db?.close();
    client.destroy();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  logger.error('Error fatal saat startup:', error);
  process.exit(1);
});
