/**
 * LumigiaBOT — Manajer Database
 * Menangani koneksi SQLite, mode WAL, dan migrasi otomatis.
 */

import SQLite from 'better-sqlite3';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logger } from '../utils/Logger.js';

import GuildSettingsRepo from './repositories/GuildSettingsRepo.js';
import TicketRepo from './repositories/TicketRepo.js';
import WarnRepo from './repositories/WarnRepo.js';
import AutoModRepo from './repositories/AutoModRepo.js';
import AuditLogRepo from './repositories/AuditLogRepo.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default class Database {
  /**
   * @param {string} dbPath - Path ke file database SQLite
   */
  constructor(dbPath) {
    this.db = new SQLite(dbPath);

    // Aktifkan mode WAL untuk performa baca/tulis konkuren yang lebih baik
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.db.pragma('busy_timeout = 5000');

    // Jalankan migrasi
    this._runMigrations();

    // Inisialisasi repository (Lapisan Akses Data)
    this.guildSettings = new GuildSettingsRepo(this.db);
    this.tickets = new TicketRepo(this.db);
    this.warnings = new WarnRepo(this.db);
    this.automod = new AutoModRepo(this.db);
    this.auditLogs = new AuditLogRepo(this.db);

    logger.info('Database terhubung dan migrasi diterapkan.');
  }

  /**
   * Menjalankan semua file migrasi SQL secara berurutan.
   * @private
   */
  _runMigrations() {
    const migrationsDir = join(__dirname, 'migrations');
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const sql = readFileSync(join(migrationsDir, file), 'utf-8');
      this.db.exec(sql);
      logger.debug(`Migrasi diterapkan: ${file}`);
    }
  }

  /**
   * Menutup koneksi database dengan baik.
   */
  close() {
    this.db.close();
    logger.info('Koneksi database ditutup.');
  }
}
