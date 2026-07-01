import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(rootDir, 'src');

function read(relPath) {
  return readFileSync(join(rootDir, relPath), 'utf8');
}

function listFiles(dir, suffix) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listFiles(fullPath, suffix));
    } else if (entry.name.endsWith(suffix)) {
      files.push(fullPath);
    }
  }

  return files;
}

function toRel(filePath) {
  return relative(rootDir, filePath).split(sep).join('/');
}

test('guild and transcript API routes require the shared guild manager guard', () => {
  const apiDir = join(srcDir, 'app', 'api');
  const routeFiles = listFiles(apiDir, 'route.ts');
  const protectedRoutes = routeFiles.filter((file) => {
    const rel = toRel(file);
    return rel.includes('/api/guilds/[guildId]/') || rel.includes('/api/transcripts/[guildId]/');
  });

  assert.ok(protectedRoutes.length > 0, 'expected protected dashboard API routes');

  for (const file of protectedRoutes) {
    const rel = toRel(file);
    const source = readFileSync(file, 'utf8');

    assert.match(source, /requireGuildManager/, `${rel} must import/use requireGuildManager`);
    assert.match(source, /await requireGuildManager\(/, `${rel} must call requireGuildManager`);
    assert.match(source, /if \(!guard\.ok\) return guard\.response/, `${rel} must return guard failure response`);
  }
});

test('sensitive transcript route validates ticket id before reading files', () => {
  const source = read('src/app/api/transcripts/[guildId]/[ticketId]/route.ts');

  assert.ok(source.includes('/^\\d+$/'), 'ticketId must be numeric only');
  assert.match(source, /Invalid transcript path/, 'invalid transcript path must return an error');
  assert.match(source, /guard\.guildId/, 'file path must use guarded guild id');
});

test('health endpoint checks env, database, schema, and runtime metadata', () => {
  const source = read('src/app/api/health/route.ts');

  assert.match(source, /checkRequiredWebEnv/, 'health route must check required web env');
  assert.match(source, /getDatabasePath/, 'health route must resolve database path');
  assert.match(source, /REQUIRED_TABLES/, 'health route must validate expected schema tables');
  assert.match(source, /missingTables/, 'health response must expose missing database tables when detailed');
  assert.match(source, /packageJson\.version/, 'health route must include app version metadata');
  assert.match(source, /Cache-Control': 'no-store'/, 'health response must not be cached');
});

test('web contracts re-export the shared contract source of truth', async () => {
  const webContracts = read('src/lib/contracts.ts');

  assert.match(webContracts, /from '..\/..\/..\/shared\/contracts\.js'/);
  assert.match(webContracts, /validateGuildSettingValue/);
  assert.match(webContracts, /validateVoiceSettingValue/);
  assert.match(webContracts, /validateLevelingSettingValue/);
  assert.match(webContracts, /validateFanArtSettingValue/);

  const shared = await import('../../shared/contracts.js');
  assert.deepEqual(shared.SCHEDULE_DAY_ORDER, [1, 2, 3, 4, 5, 6, 0]);
  assert.ok(shared.AUTOMOD_ACTIONS.includes('ban'));
  assert.equal(shared.normalizeLanguage('en'), 'en-US');
  assert.deepEqual(shared.validateGuildSettingValue('ticket_max_open', '3'), { ok: true, value: 3 });
  assert.equal(shared.validateGuildSettingValue('mod_log_channel', 'not-a-snowflake').ok, false);
  assert.deepEqual(shared.validateVoiceSettingValue('default_limit', '25'), { ok: true, value: 25 });
  assert.deepEqual(shared.validateLevelingSettingValue('multiplier', '2.5'), { ok: true, value: 2.5 });
  assert.equal(shared.validateFanArtSettingValue('vote_emoji', '').value, '\u2b50');
});

test('dashboard write routes validate values before database updates', () => {
  const routeValidators = {
    'src/app/api/guilds/[guildId]/settings/route.ts': 'validateGuildSettingValue',
    'src/app/api/guilds/[guildId]/voice/route.ts': 'validateVoiceSettingValue',
    'src/app/api/guilds/[guildId]/leveling/route.ts': 'validateLevelingSettingValue',
    'src/app/api/guilds/[guildId]/fanart/route.ts': 'validateFanArtSettingValue',
  };

  for (const [rel, validator] of Object.entries(routeValidators)) {
    const source = read(rel);
    assert.match(source, new RegExp(`import \\{ ${validator} \\}`), `${rel} must import ${validator}`);
    assert.match(source, new RegExp(`const validation = ${validator}\\(body\\.field, body\\.value\\)`));
    assert.match(source, /if \('error' in validation\)/);
    assert.match(source, /validation\.value/);
  }
});

test('dashboard discord data loading is deduped and reused by channel and role controls', () => {
  const helperPath = join(rootDir, 'src', 'components', 'dashboard', 'discordDataClient.ts');
  assert.ok(existsSync(helperPath), 'discord data client helper must exist');

  const helper = read('src/components/dashboard/discordDataClient.ts');
  assert.match(helper, /const inflight = new Map/, 'helper must dedupe in-flight requests');
  assert.match(helper, /RETRYABLE_STATUS/, 'helper must retry transient failures');

  for (const rel of [
    'src/components/dashboard/ChannelSelect.tsx',
    'src/components/dashboard/RoleSelect.tsx',
    'src/components/dashboard/StreamAlertsManager.tsx',
  ]) {
    const source = read(rel);
    assert.match(source, /getGuildDiscordData/, `${rel} must use shared discord data helper`);
  }
});

test('dashboard save components use the shared dashboard API error helper', () => {
  const helperPath = join(rootDir, 'src', 'components', 'dashboard', 'dashboardApi.ts');
  assert.ok(existsSync(helperPath), 'dashboard API helper must exist');

  const helper = read('src/components/dashboard/dashboardApi.ts');
  assert.match(helper, /class DashboardApiError/, 'helper must expose typed API errors');
  assert.match(helper, /readApiError/, 'helper must parse API error payloads');

  for (const rel of [
    'src/components/dashboard/AutoModCard.tsx',
    'src/components/dashboard/ChannelSelect.tsx',
    'src/components/dashboard/FanArtSettingsForm.tsx',
    'src/components/dashboard/LevelingSettingsForm.tsx',
    'src/components/dashboard/RoleSelect.tsx',
    'src/components/dashboard/ScheduleManager.tsx',
    'src/components/dashboard/SettingsForm.tsx',
    'src/components/dashboard/StreamAlertsManager.tsx',
    'src/components/dashboard/VoiceSettingsForm.tsx',
  ]) {
    const source = read(rel);
    assert.match(source, /dashboardApi/, `${rel} must use shared dashboard API helper`);
  }
});
