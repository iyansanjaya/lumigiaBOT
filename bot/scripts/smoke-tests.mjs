import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import SQLite from 'better-sqlite3';

import {
  AUTOMOD_ACTIONS,
  AUTOMOD_FILTER_KEYS,
  ALL_DATABASE_TABLES,
  DEFAULT_WARN_ESCALATION_JSON,
  GUILD_SETTINGS_DEFAULTS,
  REQUIRED_DATABASE_TABLES,
  DEFAULT_SCHEDULE_TIMEZONE,
  SCHEDULE_DAY_NAMES,
  SCHEDULE_DAY_ORDER,
  SCHEDULE_TIMEZONE_OPTIONS,
  getNextScheduleOccurrenceIso,
  getScheduleTimezoneLabel,
  isValidAutomodAction,
  isValidAutomodFilter,
  isValidScheduleTime,
  normalizeScheduleTimezone,
  normalizeLanguage,
  validateFanArtSettingValue,
  validateGuildSettingValue,
  validateLevelingSettingValue,
  validateVoiceSettingValue,
} from '../../shared/contracts.js';
import { getDataDir, getDatabasePath } from '../src/config/env.js';

process.env.LOG_LEVEL = 'ERROR';

const botDir = dirname(dirname(fileURLToPath(import.meta.url)));

const { default: BotDatabase } = await import('../src/database/Database.js');
const { createServiceLogger } = await import('../src/utils/Logger.js');
const { parseStoredTimestamp } = await import('../src/utils/TimeFormatter.js');

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

function readSource(relPath) {
  return readFileSync(join(botDir, relPath), 'utf8');
}

function countRows(db, sql, params = []) {
  return db.prepare(sql).get(...params).count;
}

function seedGuildData(database, guildId, suffix) {
  const db = database.db;
  const userId = `user-${suffix}`;
  const moderatorId = `moderator-${suffix}`;
  const channelId = `channel-${suffix}`;
  const roleId = `role-${suffix}`;

  db.prepare('INSERT INTO guild_settings (guild_id) VALUES (?)').run(guildId);
  db.prepare('INSERT INTO warnings (guild_id, user_id, moderator_id, reason) VALUES (?, ?, ?, ?)')
    .run(guildId, userId, moderatorId, 'reason');
  db.prepare('INSERT INTO audit_logs (guild_id, action, moderator_id, target_id, reason, details) VALUES (?, ?, ?, ?, ?, ?)')
    .run(guildId, 'warn', moderatorId, userId, 'reason', '{}');
  db.prepare('INSERT INTO automod_filters (guild_id, filter_name, enabled, action, config) VALUES (?, ?, ?, ?, ?)')
    .run(guildId, 'spam', 1, 'delete', '{}');
  db.prepare('INSERT INTO automod_whitelist (guild_id, type, target_id) VALUES (?, ?, ?)')
    .run(guildId, 'user', userId);
  db.prepare('INSERT INTO word_filter (guild_id, word, is_regex) VALUES (?, ?, ?)')
    .run(guildId, `blocked-${suffix}`, 0);
  db.prepare('INSERT INTO tickets (guild_id, channel_id, user_id, category) VALUES (?, ?, ?, ?)')
    .run(guildId, channelId, userId, 'general');
  db.prepare('INSERT INTO voice_settings (guild_id, hub_channel_id, category_id) VALUES (?, ?, ?)')
    .run(guildId, `hub-${suffix}`, `category-${suffix}`);
  db.prepare('INSERT INTO temp_channels (channel_id, guild_id, owner_id, name) VALUES (?, ?, ?, ?)')
    .run(`voice-${suffix}`, guildId, userId, 'Temp');

  const panelId = db
    .prepare('INSERT INTO reaction_role_panels (guild_id, channel_id, title) VALUES (?, ?, ?)')
    .run(guildId, channelId, 'Panel').lastInsertRowid;
  db.prepare('INSERT INTO reaction_role_entries (panel_id, role_id, label) VALUES (?, ?, ?)')
    .run(panelId, roleId, 'Role');

  const giveawayId = db
    .prepare('INSERT INTO giveaways (guild_id, channel_id, prize, winners_count, host_id, ends_at) VALUES (?, ?, ?, ?, ?, ?)')
    .run(guildId, channelId, 'Prize', 1, userId, '2026-07-02T00:00:00.000Z').lastInsertRowid;
  db.prepare('INSERT INTO giveaway_entries (giveaway_id, user_id) VALUES (?, ?)')
    .run(giveawayId, userId);

  db.prepare('INSERT INTO stream_schedule (guild_id, day_of_week, time, title) VALUES (?, ?, ?, ?)')
    .run(guildId, 1, `10:0${suffix}`, 'Stream');
  db.prepare('INSERT INTO schedule_settings (guild_id, auto_post_channel, auto_post_enabled) VALUES (?, ?, ?)')
    .run(guildId, channelId, 1);
  db.prepare('INSERT INTO custom_embeds (guild_id, name, embed_data) VALUES (?, ?, ?)')
    .run(guildId, `embed-${suffix}`, '{}');
  db.prepare('INSERT INTO social_links (guild_id, twitch) VALUES (?, ?)')
    .run(guildId, `streamer-${suffix}`);
  db.prepare('INSERT INTO user_xp (guild_id, user_id, xp, level, messages) VALUES (?, ?, ?, ?, ?)')
    .run(guildId, userId, 100, 2, 5);
  db.prepare('INSERT INTO level_rewards (guild_id, level, role_id) VALUES (?, ?, ?)')
    .run(guildId, 2, roleId);
  db.prepare('INSERT INTO leveling_settings (guild_id, enabled) VALUES (?, ?)')
    .run(guildId, 1);
  db.prepare('INSERT INTO stream_notifications (guild_id, platform, platform_user, notify_channel) VALUES (?, ?, ?, ?)')
    .run(guildId, 'twitch', `streamer-${suffix}`, channelId);
  db.prepare('INSERT INTO fanart_settings (guild_id, enabled) VALUES (?, ?)')
    .run(guildId, 1);

  const submissionId = db
    .prepare('INSERT INTO fanart_submissions (guild_id, user_id, image_url, status) VALUES (?, ?, ?, ?)')
    .run(guildId, userId, `https://example.com/${suffix}.png`, 'approved').lastInsertRowid;
  db.prepare('INSERT INTO fanart_votes (submission_id, user_id) VALUES (?, ?)')
    .run(submissionId, userId);
  db.prepare('INSERT INTO daily_stats (guild_id, date, messages) VALUES (?, ?, ?)')
    .run(guildId, '2026-07-02', 10);
  db.prepare('INSERT INTO channel_activity (guild_id, channel_id, date, messages) VALUES (?, ?, ?, ?)')
    .run(guildId, channelId, '2026-07-02', 10);

  return { panelId, giveawayId, submissionId };
}

test('shared contracts keep bot and dashboard values aligned', () => {
  assert.equal(GUILD_SETTINGS_DEFAULTS.warn_escalation, DEFAULT_WARN_ESCALATION_JSON);
  assert.equal(normalizeLanguage('en'), 'en-US');
  assert.equal(normalizeLanguage('id'), 'id');
  assert.equal(normalizeLanguage('unknown'), GUILD_SETTINGS_DEFAULTS.language);

  assert.deepEqual(SCHEDULE_DAY_ORDER, [1, 2, 3, 4, 5, 6, 0]);
  assert.equal(SCHEDULE_DAY_NAMES[0], 'Minggu');
  assert.equal(SCHEDULE_DAY_NAMES[1], 'Senin');
  assert.equal(DEFAULT_SCHEDULE_TIMEZONE, 'Asia/Jakarta');
  assert.ok(SCHEDULE_TIMEZONE_OPTIONS.some((option) => option.value === 'Asia/Jakarta'));
  assert.equal(normalizeScheduleTimezone('WIB'), 'Asia/Jakarta');
  assert.equal(normalizeScheduleTimezone('wita'), 'Asia/Makassar');
  assert.equal(getScheduleTimezoneLabel('Asia/Jayapura'), 'WIT (UTC+9)');
  assert.equal(isValidScheduleTime('00:00'), true);
  assert.equal(isValidScheduleTime('23:59'), true);
  assert.equal(isValidScheduleTime('24:00'), false);
  assert.equal(isValidScheduleTime('99:99'), false);
  assert.equal(
    getNextScheduleOccurrenceIso(1, '20:00', 'Asia/Jakarta', new Date('2026-07-06T10:00:00.000Z')),
    '2026-07-06T13:00:00.000Z',
  );
  assert.equal(
    getNextScheduleOccurrenceIso(1, '20:00', 'Asia/Jakarta', new Date('2026-07-06T14:00:00.000Z')),
    '2026-07-13T13:00:00.000Z',
  );

  assert.ok(AUTOMOD_ACTIONS.includes('ban'));
  assert.ok(isValidAutomodAction('ban'));
  assert.ok(AUTOMOD_FILTER_KEYS.every((filter) => isValidAutomodFilter(filter)));
  assert.equal(isValidAutomodFilter('unknown'), false);
  assert.ok(ALL_DATABASE_TABLES.includes('guild_settings'));
  assert.ok(REQUIRED_DATABASE_TABLES.every((table) => ALL_DATABASE_TABLES.includes(table)));

  assert.deepEqual(validateGuildSettingValue('language', 'en'), { ok: true, value: 'en-US' });
  assert.deepEqual(validateGuildSettingValue('ticket_auto_close_hours', '24'), { ok: true, value: 24 });
  assert.equal(validateGuildSettingValue('mod_log_channel', 'invalid').ok, false);
  assert.deepEqual(validateVoiceSettingValue('default_limit', '10'), { ok: true, value: 10 });
  assert.deepEqual(validateLevelingSettingValue('ignored_channels', '[]'), { ok: true, value: '[]' });
  assert.equal(validateFanArtSettingValue('vote_emoji', '').value, '\u2b50');
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

  for (const table of ALL_DATABASE_TABLES) {
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

test('guild data cleanup removes only the target guild across all feature tables', (t) => {
  const tempDb = createTempDb();
  const db = new BotDatabase(tempDb.dbPath);
  t.after(() => {
    db.close();
    rmSync(tempDb.dir, { recursive: true, force: true });
  });

  const targetGuildId = '123456789012345678';
  const otherGuildId = '223456789012345678';
  const targetRefs = seedGuildData(db, targetGuildId, 1);
  const otherRefs = seedGuildData(db, otherGuildId, 2);

  const result = db.deleteGuildData(targetGuildId);
  assert.ok(result.totalDeletedRows > 0);
  assert.equal(result.deletedRowsByTable.guild_settings, 1);
  assert.equal(result.deletedRowsByTable.fanart_votes, 1);
  assert.equal(result.deletedRowsByTable.giveaway_entries, 1);
  assert.equal(result.deletedRowsByTable.reaction_role_entries, 1);

  for (const table of [
    'guild_settings',
    'warnings',
    'audit_logs',
    'automod_filters',
    'automod_whitelist',
    'word_filter',
    'tickets',
    'voice_settings',
    'temp_channels',
    'reaction_role_panels',
    'giveaways',
    'stream_schedule',
    'schedule_settings',
    'custom_embeds',
    'social_links',
    'user_xp',
    'level_rewards',
    'leveling_settings',
    'stream_notifications',
    'fanart_settings',
    'fanart_submissions',
    'daily_stats',
    'channel_activity',
  ]) {
    assert.equal(countRows(db.db, `SELECT COUNT(*) as count FROM ${table} WHERE guild_id = ?`, [targetGuildId]), 0, `${table} target guild rows should be deleted`);
    assert.equal(countRows(db.db, `SELECT COUNT(*) as count FROM ${table} WHERE guild_id = ?`, [otherGuildId]), 1, `${table} other guild rows should remain`);
  }

  assert.equal(countRows(db.db, 'SELECT COUNT(*) as count FROM reaction_role_entries WHERE panel_id = ?', [targetRefs.panelId]), 0);
  assert.equal(countRows(db.db, 'SELECT COUNT(*) as count FROM reaction_role_entries WHERE panel_id = ?', [otherRefs.panelId]), 1);
  assert.equal(countRows(db.db, 'SELECT COUNT(*) as count FROM giveaway_entries WHERE giveaway_id = ?', [targetRefs.giveawayId]), 0);
  assert.equal(countRows(db.db, 'SELECT COUNT(*) as count FROM giveaway_entries WHERE giveaway_id = ?', [otherRefs.giveawayId]), 1);
  assert.equal(countRows(db.db, 'SELECT COUNT(*) as count FROM fanart_votes WHERE submission_id = ?', [targetRefs.submissionId]), 0);
  assert.equal(countRows(db.db, 'SELECT COUNT(*) as count FROM fanart_votes WHERE submission_id = ?', [otherRefs.submissionId]), 1);
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

test('backup script creates a verified readable backup', (t) => {
  const tempDb = createTempDb();
  const backupPath = join(tempDb.dir, 'verified-backup.db');
  const guildId = '123456789012345678';

  const db = new BotDatabase(tempDb.dbPath);
  db.guildSettings.set(guildId, 'language', 'id');
  db.close();

  t.after(() => {
    rmSync(tempDb.dir, { recursive: true, force: true });
  });

  const output = execFileSync(
    process.execPath,
    [join(botDir, 'scripts', 'backup-db.mjs'), `--output=${backupPath}`],
    {
      cwd: botDir,
      env: {
        ...process.env,
        DATABASE_PATH: tempDb.dbPath,
        LOG_LEVEL: 'ERROR',
      },
      encoding: 'utf8',
    },
  );

  assert.ok(existsSync(backupPath), 'backup file should be created');
  assert.match(output, /Database backup created:/);
  assert.match(output, /Database backup verified:/);

  const backup = new SQLite(backupPath, { readonly: true, fileMustExist: true });
  try {
    const settings = backup
      .prepare('SELECT language FROM guild_settings WHERE guild_id = ?')
      .get(guildId);
    assert.equal(settings.language, 'id');
  } finally {
    backup.close();
  }
});

test('stored timestamp parser supports sqlite and ISO timestamps', () => {
  const sqliteTimestamp = parseStoredTimestamp('2026-07-01 12:30:00');
  const isoTimestamp = parseStoredTimestamp('2026-07-01T12:30:00.000Z');

  assert.equal(sqliteTimestamp, Date.parse('2026-07-01T12:30:00Z'));
  assert.equal(isoTimestamp, Date.parse('2026-07-01T12:30:00.000Z'));
  assert.equal(parseStoredTimestamp('not-a-date'), null);
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

test('high-value background services use structured service loggers', () => {
  const serviceFiles = {
    'src/events/client/ready.js': 'startup',
    'src/events/guild/guildCreate.js': 'guild-lifecycle',
    'src/events/guild/guildDelete.js': 'guild-lifecycle',
    'src/modules/giveaway/GiveawayScheduler.js': 'giveaway-scheduler',
    'src/modules/giveaway/GiveawayService.js': 'giveaway-service',
    'src/modules/streaming/StreamNotifService.js': 'stream-notifications',
    'src/modules/automod/AutoModEngine.js': 'automod',
    'src/modules/automod/PhishingService.js': 'phishing-service',
    'src/modules/antiraid/AntiRaidEngine.js': 'anti-raid',
    'src/modules/antiraid/LockdownManager.js': 'lockdown-manager',
    'src/modules/analytics/AnalyticsService.js': 'analytics-service',
  };

  for (const [relPath, serviceName] of Object.entries(serviceFiles)) {
    const source = readSource(relPath);
    assert.match(source, /createServiceLogger/, `${relPath} must use createServiceLogger`);
    assert.match(source, new RegExp(`createServiceLogger\\(['"]${serviceName}['"]\\)`));
  }

  const scheduleCommand = readSource('src/commands/streaming/schedule.js');
  assert.match(scheduleCommand, /createServiceLogger\(['"]schedule-command['"]\)/);
  assert.doesNotMatch(scheduleCommand, /console\.error/);
});

test('guild delete lifecycle uses centralized data and transcript cleanup', () => {
  const databaseSource = readSource('src/database/Database.js');
  const guildDeleteSource = readSource('src/events/guild/guildDelete.js');

  assert.match(databaseSource, /GUILD_DATA_DELETE_STATEMENTS/, 'guild cleanup SQL must be centralized');
  assert.match(databaseSource, /fanart_votes/, 'guild cleanup must remove fan art vote child rows');
  assert.match(databaseSource, /giveaway_entries/, 'guild cleanup must remove giveaway entry child rows');
  assert.match(databaseSource, /reaction_role_entries/, 'guild cleanup must remove reaction role entry child rows');
  assert.match(databaseSource, /deleteGuildData/, 'database must expose a single guild cleanup method');
  assert.match(guildDeleteSource, /deleteGuildData\(guild\.id\)/, 'guildDelete must use centralized cleanup');
  assert.match(guildDeleteSource, /removeTranscriptDir/, 'guildDelete must remove transcript files for the guild');
  assert.match(guildDeleteSource, /guild_data_deleted/, 'guildDelete must log cleanup outcome');
});
