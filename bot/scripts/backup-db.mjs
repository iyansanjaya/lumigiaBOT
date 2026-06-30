import Database from 'better-sqlite3';
import { config } from 'dotenv';
import { existsSync, mkdirSync } from 'node:fs';
import { basename, dirname, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const dbPath = resolveDatabasePath();
const backupPath = resolveBackupPath(dbPath);

if (!existsSync(dbPath)) {
  console.error(`Database file not found: ${dbPath}`);
  process.exit(1);
}

mkdirSync(dirname(backupPath), { recursive: true });

const db = new Database(dbPath, { readonly: true, fileMustExist: true });

try {
  await db.backup(backupPath);
  console.log(`Database backup created: ${backupPath}`);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Database backup failed: ${message}`);
  process.exitCode = 1;
} finally {
  db.close();
}
