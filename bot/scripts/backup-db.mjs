import Database from 'better-sqlite3';
import { config } from 'dotenv';
import { existsSync, mkdirSync } from 'node:fs';
import { basename, dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { REQUIRED_DATABASE_TABLES } from '../../shared/contracts.js';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const botDir = resolve(scriptDir, '..');
const rootDir = resolve(botDir, '..');

for (const envPath of [resolve(rootDir, '.env'), resolve(botDir, '.env')]) {
  if (existsSync(envPath)) {
    config({ path: envPath, override: false });
  }
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

function getArgValue(name) {
  const prefix = `${name}=`;
  const arg = process.argv.find((item) => item.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : null;
}

function hasFlag(name) {
  return process.argv.includes(name);
}

function resolveDatabasePath() {
  if (process.env.DATABASE_PATH) {
    if (isAbsolute(process.env.DATABASE_PATH)) {
      return process.env.DATABASE_PATH;
    }

    const candidates = [
      resolve(process.cwd(), process.env.DATABASE_PATH),
      resolve(rootDir, process.env.DATABASE_PATH),
      resolve(botDir, process.env.DATABASE_PATH),
    ];

    return candidates.find((candidate) => existsSync(candidate)) || candidates[0];
  }

  const rootDataPath = resolve(rootDir, 'data', 'lumigiabot.db');
  if (existsSync(rootDataPath)) {
    return rootDataPath;
  }

  return resolve(botDir, 'data', 'lumigiabot.db');
}

function resolveBackupPath(dbPath) {
  const output = getArgValue('--output');
  if (output) {
    return resolve(output);
  }

  const backupDir = resolve(dirname(dbPath), 'backups');
  const dbName = basename(dbPath, '.db');
  return resolve(backupDir, `${dbName}-${timestamp()}.db`);
}

function verifyBackup(backupPath) {
  const backup = new Database(backupPath, { readonly: true, fileMustExist: true });

  try {
    const integrity = backup.pragma('integrity_check', { simple: true });
    if (integrity !== 'ok') {
      throw new Error(`SQLite integrity_check failed: ${integrity}`);
    }

    const tableRows = backup
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all();
    const tables = new Set(tableRows.map((row) => row.name));
    const missingTables = REQUIRED_DATABASE_TABLES.filter((table) => !tables.has(table));

    if (missingTables.length > 0) {
      throw new Error(`Backup is missing required tables: ${missingTables.join(', ')}`);
    }

    return { tableCount: tables.size };
  } finally {
    backup.close();
  }
}

const dbPath = resolveDatabasePath();
const backupPath = resolveBackupPath(dbPath);
const shouldVerify = !hasFlag('--no-verify');

if (!existsSync(dbPath)) {
  console.error(`Database file not found: ${dbPath}`);
  process.exit(1);
}

if (resolve(dbPath) === resolve(backupPath)) {
  console.error('Backup path must be different from the source database path.');
  process.exit(1);
}

mkdirSync(dirname(backupPath), { recursive: true });

const db = new Database(dbPath, { readonly: true, fileMustExist: true });

try {
  await db.backup(backupPath);
  console.log(`Database backup created: ${backupPath}`);

  if (shouldVerify) {
    const result = verifyBackup(backupPath);
    console.log(`Database backup verified: ${result.tableCount} tables readable.`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Database backup failed: ${message}`);
  process.exitCode = 1;
} finally {
  db.close();
}
