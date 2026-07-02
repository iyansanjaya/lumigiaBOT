import Database from 'better-sqlite3';
import { NextResponse } from 'next/server';
import { REQUIRED_DATABASE_TABLES } from '@/lib/contracts';
import { checkRequiredWebEnv, getDataDir, getDatabasePath } from '@/lib/env';
import packageJson from '../../../../package.json';

export const dynamic = 'force-dynamic';

function shouldExposeDetails() {
  return process.env.NODE_ENV !== 'production' || process.env.HEALTHCHECK_DETAILS === 'true';
}

function checkDatabase() {
  let db: Database.Database | null = null;
  const path = getDatabasePath();
  const dataDir = getDataDir();

  try {
    db = new Database(path, { fileMustExist: true });
    db.prepare('SELECT 1').get();

    const tableRows = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all() as { name: string }[];
    const tables = new Set(tableRows.map((row) => row.name));
    const missingTables = REQUIRED_DATABASE_TABLES.filter((table) => !tables.has(table));

    return {
      ok: missingTables.length === 0,
      path,
      dataDir,
      missingTables,
    };
  } catch (error) {
    return {
      ok: false,
      path,
      dataDir,
      missingTables: [...REQUIRED_DATABASE_TABLES],
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  } finally {
    db?.close();
  }
}

function getRuntimeInfo() {
  return {
    app: packageJson.name,
    version: packageJson.version,
    nodeEnv: process.env.NODE_ENV ?? 'development',
    nodeVersion: process.version,
    uptimeSeconds: Math.round(process.uptime()),
  };
}

export async function GET() {
  const env = checkRequiredWebEnv();
  const database = checkDatabase();
  const ok = env.ok && database.ok;
  const exposeDetails = shouldExposeDetails();

  return NextResponse.json(
    {
      status: ok ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      runtime: getRuntimeInfo(),
      checks: {
        env: exposeDetails ? env : { ok: env.ok },
        database: exposeDetails ? database : { ok: database.ok },
      },
    },
    {
      status: ok ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    },
  );
}
