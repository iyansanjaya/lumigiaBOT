import Database from 'better-sqlite3';
import { NextResponse } from 'next/server';
import { checkRequiredWebEnv, getDataDir, getDatabasePath } from '@/lib/env';

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

    return { ok: true, path, dataDir };
  } catch (error) {
    return {
      ok: false,
      path,
      dataDir,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  } finally {
    db?.close();
  }
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
