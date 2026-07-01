import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  AUTOMOD_ACTIONS,
  AUTOMOD_FILTER_KEYS,
  DEFAULT_WARN_ESCALATION_JSON,
  GUILD_SETTINGS_DEFAULTS,
  SCHEDULE_DAY_NAMES,
  SCHEDULE_DAY_ORDER,
  isValidAutomodAction,
  isValidAutomodFilter,
  normalizeLanguage,
} from '../../shared/contracts.js';
import { getDataDir, getDatabasePath } from '../src/config/env.js';

process.env.LOG_LEVEL = 'ERROR';

const { default: BotDatabase } = await import('../src/database/Database.js');
const { createServiceLogger } = await import('../src/utils/Logger.js');

function withEnv(values, fn) {
  const previous = new Map();

  for (const [key, value] of Object.entries(values)) {
    previous.set(key, process.env[key]);
    process.env[key] = value;
  }

  try {
    return fn();
  } finally {
    for (const [key, value] of previous.entries()) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

function createTempDb() {
  const dir = mkdtempSync(join(tmpdir(), 'lumigiabot-smoke-'));

  return {
    dir,
    dbPath: join(dir, 'lumigiabot.db'),
  };
}

test('shared contracts keep bot and dashboard values aligned', () => {
  assert.equal(GUILD_SETTINGS_DEFAULTS.warn_escalation, DEFAULT_WARN_ESCALATION_JSON);
  assert.equal(normalizeLanguage('en'), 'en-US');
  assert.equal(normalizeLanguage('id'), 'id');
  assert.equal(normalizeLanguage('unknown'), GUILD_SETTINGS_DEFAULTS.language);

  assert.deepEqual(SCHEDULE_DAY_ORDER, [1, 2, 3, 4, 5, 6, 0]);
  assert.equal(SCHEDULE_DAY_NAMES[0], 'Minggu');
  assert.equal(SCHEDULE_DAY_NAMES[1], 'Senin');

  assert.ok(AUTOMOD_ACTIONS.includes('ban'));
  assert.ok(isValidAutomodAction('ban'));
  assert.ok(AUTOMOD_FILTER_KEYS.every((filter) => isValidAutomodFilter(filter)));
  assert.equal(isValidAutomodFilter('unknown'), false);
});

test('database migrations and core repositories can read and write', (t) => {
  const tempDb = createTempDb();
  const db = new BotDatabase(tempDb.dbPath);
  t.after(() => {
    db.close();
    rmSync(tempDb.dir, { recursive: true, force: true });
  });

  const tables = new Set(
    db.db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all()
      .map((row) => row.name),
  );

  for (const table of [
    'guild_settings',
    'automod_filters',
    'automod_whitelist',
    'stream_schedule',
    'schedule_settings',
    'leveling_settings',
    'fanart_settings',
    'daily_stats',
  ]) {
    assert.ok(tables.has(table), `expected table ${table}`);
  }

  const guildId = '123456789012345678';
  db.guildSettings.set(guildId, 'language', 'en');
  db.guildSettings.set(guildId, 'welcome_enabled', 1);

  const settings = db.guildSettings.get(guildId);
  assert.equal(settings.language, 'en-US');
  assert.equal(settings.welcome_enabled, 1);
  assert.equal(settings.warn_escalation, DEFAULT_WARN_ESCALATION_JSON);

  db.automod.setFilter(guildId, 'spam', true, 'ban', '{"threshold":3}');
  const spamFilter = db.automod.getFilter(guildId, 'spam');
  assert.equal(spamFilter.enabled, 1);
  assert.equal(spamFilter.action, 'ban');
  assert.equal(spamFilter.config, '{"threshold":3}');

  assert.throws(
    () => db.automod.setFilter(guildId, 'unknown', true, 'delete'),
    /Invalid automod filter/,
  );
  assert.throws(
    () => db.automod.setFilter(guildId, 'spam', true, 'unknown'),
    /Invalid automod action/,
  );
});

test('database path helpers support the Docker shared volume path', () => {
  withEnv(
    {
      DATABASE_PATH: '/app/data/lumigiabot.db',
      NODE_ENV: 'production',
    },
    () => {
      assert.equal(getDatabasePath(), '/app/data/lumigiabot.db');
      assert.equal(getDataDir(), '/app/data');
    },
  );
});

test('service logger formats context and redacts sensitive values', () => {
  const serviceLog = createServiceLogger('smoke-test');
  const originalConsoleLog = console.log;
  const lines = [];

  console.log = (...args) => {
    lines.push(args.join(' '));
  };

  try {
    serviceLog.error('event_failed', {
      guildId: '123456789012345678',
      count: 2,
      authToken: 'super-secret-token',
      ignored: undefined,
    });
  } finally {
    console.log = originalConsoleLog;
  }

  assert.equal(lines.length, 1);
  assert.match(lines[0], /service="smoke-test"/);
  assert.match(lines[0], /action="event_failed"/);
  assert.match(lines[0], /guildId="123456789012345678"/);
  assert.match(lines[0], /count=2/);
  assert.match(lines[0], /authToken="\[redacted\]"/);
  assert.doesNotMatch(lines[0], /super-secret-token/);
  assert.doesNotMatch(lines[0], /ignored=/);
});
