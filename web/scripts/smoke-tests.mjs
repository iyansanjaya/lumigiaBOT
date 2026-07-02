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

test('dashboard guild pages require page-level guild access guard', () => {
  const source = read('src/app/(dashboard)/dashboard/servers/[guildId]/layout.tsx');

  assert.match(source, /await auth\(\)/, 'guild dashboard layout must require a session');
  assert.match(source, /DISCORD_SNOWFLAKE_PATTERN/, 'guild dashboard layout must validate guild id format');
  assert.match(source, /await params/, 'guild dashboard layout must read dynamic route params');
  assert.match(source, /canManageGuild/, 'guild dashboard layout must verify Manage Guild access');
  assert.match(source, /redirect\('\/dashboard\/servers'\)/, 'invalid or forbidden guilds must leave the page');
});

test('server picker avoids prefetching protected guild routes', () => {
  const source = read('src/app/(dashboard)/dashboard/servers/page.tsx');

  assert.match(source, /prefetch=\{false\}/, 'guild manage links must not prefetch protected guild routes');
  assert.match(source, /session\?\.accessToken/, 'server picker must require a Discord access token before fetching guilds');
  assert.match(source, /getManageableBotGuilds/, 'server picker must only show guilds where the bot is installed');
});

test('dashboard auth refreshes expired Discord access tokens', () => {
  const authSource = read('src/lib/auth.ts');
  const typeSource = read('src/types/next-auth.d.ts');
  const layoutSource = read('src/app/(dashboard)/layout.tsx');

  assert.match(authSource, /refreshDiscordAccessToken/, 'auth must refresh expired provider tokens');
  assert.match(authSource, /DISCORD_TOKEN_ENDPOINT/, 'auth must use the Discord OAuth token endpoint');
  assert.match(authSource, /grant_type: 'refresh_token'/, 'auth must use OAuth refresh_token grant');
  assert.match(authSource, /accessTokenExpiresAt/, 'auth must store access token expiry in the JWT/session');
  assert.match(authSource, /RefreshTokenError/, 'auth must expose refresh failures to the session');
  assert.match(typeSource, /error\?: AuthSessionError/, 'session type must expose auth refresh errors');
  assert.match(typeSource, /accessTokenExpiresAt\?: number/, 'session and JWT types must include token expiry');
  assert.match(layoutSource, /session\.error === 'RefreshTokenError'/, 'dashboard layout must detect failed token refresh');
  assert.match(layoutSource, /await signIn\('discord'/, 'dashboard layout must force Discord re-authentication');
});

test('dashboard overview scopes aggregate stats to manageable bot guilds', () => {
  const page = read('src/app/(dashboard)/dashboard/page.tsx');

  assert.match(page, /await auth\(\)/, 'dashboard overview must read the active session');
  assert.match(page, /session\?\.accessToken/, 'dashboard overview must require the Discord access token');
  assert.match(page, /getUserGuilds/, 'dashboard overview must fetch guilds for the current user');
  assert.match(page, /getManageableBotGuilds/, 'dashboard overview must filter by Manage Guild permission and bot presence');
  assert.match(page, /getDashboardStatsForGuilds/, 'dashboard overview must use scoped stats');
  assert.doesNotMatch(page, /getDashboardStats\(/, 'dashboard overview must not read global stats');

  const database = read('src/lib/database.ts');
  assert.match(database, /export function getDashboardStatsForGuilds/, 'database must expose scoped dashboard stats');
  assert.match(database, /uniqueValidGuildIds/, 'scoped dashboard stats must validate guild ids');
  assert.match(database, /WHERE guild_id IN/, 'ticket and warning counts must be scoped by guild id');
  assert.doesNotMatch(database, /export function getDashboardStats\(\)/, 'global dashboard stats must not be exported');
  assert.doesNotMatch(database, /SELECT COUNT\(\*\) as count FROM tickets'\)\.get\(\)/, 'ticket stats must not count all guilds globally');
  assert.doesNotMatch(database, /SELECT COUNT\(\*\) as count FROM warnings'\)\.get\(\)/, 'warning stats must not count all guilds globally');
});

test('discord guild permissions are cached and checked with full bitfields', () => {
  const source = read('src/lib/discord-api.ts');

  assert.match(source, /userGuildsCache/, 'user guild fetches should be cached briefly');
  assert.match(source, /userGuildsInflight/, 'concurrent user guild fetches should be deduped');
  assert.match(source, /botGuildCache/, 'bot guild membership checks should be cached briefly');
  assert.match(source, /botGuildInflight/, 'concurrent bot guild membership checks should be deduped');
  assert.match(source, /export async function isBotInGuild/, 'dashboard access must verify bot guild membership');
  assert.match(source, /export async function getManageableBotGuilds/, 'server lists must combine user permission and bot presence');
  assert.match(source, /BigInt\(guild\.permissions\)/, 'permission checks should support Discord permission bitfields safely');
  assert.match(source, /ADMINISTRATOR/, 'Administrator permission should allow dashboard management');
  assert.match(source, /MANAGE_GUILD/, 'Manage Guild permission should allow dashboard management');
  assert.match(source, /return isBotInGuild\(guildId\)/, 'canManageGuild must require the bot to still be in the guild');
});

test('health endpoint checks env, database, schema, and runtime metadata', () => {
  const source = read('src/app/api/health/route.ts');

  assert.match(source, /checkRequiredWebEnv/, 'health route must check required web env');
  assert.match(source, /getDatabasePath/, 'health route must resolve database path');
  assert.match(source, /REQUIRED_DATABASE_TABLES/, 'health route must validate expected schema tables');
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
  assert.match(webContracts, /isValidScheduleTime/);
  assert.match(webContracts, /normalizeScheduleTimezone/);
  assert.match(webContracts, /ALL_DATABASE_TABLES/);
  assert.match(webContracts, /REQUIRED_DATABASE_TABLES/);

  const shared = await import('../../shared/contracts.js');
  assert.deepEqual(shared.SCHEDULE_DAY_ORDER, [1, 2, 3, 4, 5, 6, 0]);
  assert.equal(shared.normalizeScheduleTimezone('WIB'), 'Asia/Jakarta');
  assert.equal(shared.isValidScheduleTime('23:59'), true);
  assert.equal(shared.isValidScheduleTime('24:00'), false);
  assert.ok(shared.AUTOMOD_ACTIONS.includes('ban'));
  assert.ok(shared.ALL_DATABASE_TABLES.includes('guild_settings'));
  assert.ok(shared.ALL_DATABASE_TABLES.includes('fanart_votes'));
  assert.ok(shared.REQUIRED_DATABASE_TABLES.every((table) => shared.ALL_DATABASE_TABLES.includes(table)));
  assert.equal(shared.normalizeLanguage('en'), 'en-US');
  assert.deepEqual(shared.validateGuildSettingValue('ticket_max_open', '3'), { ok: true, value: 3 });
  assert.equal(shared.validateGuildSettingValue('mod_log_channel', 'not-a-snowflake').ok, false);
  assert.deepEqual(shared.validateVoiceSettingValue('default_limit', '25'), { ok: true, value: 25 });
  assert.deepEqual(shared.validateLevelingSettingValue('multiplier', '2.5'), { ok: true, value: 2.5 });
  assert.equal(shared.validateFanArtSettingValue('vote_emoji', '').value, '\u2b50');
});

test('schedule API validates time and timezone through shared contracts', () => {
  const source = read('src/app/api/guilds/[guildId]/schedule/route.ts');

  assert.match(source, /isValidScheduleTime/, 'schedule route must validate HH:MM through shared contracts');
  assert.match(source, /normalizeScheduleTimezone/, 'schedule route must normalize timezone through shared contracts');
  assert.doesNotMatch(source, /\/\\\^\\d\{2\}:\\d\{2\}\\\$\/\.test/, 'schedule route must not use loose local HH:MM regex');
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

test('dashboard entity-heavy views render Discord names before raw ids', () => {
  const identityHelper = read('src/lib/discord-identity.ts');
  assert.match(identityHelper, /getGuildIdentityMaps/, 'server pages must share one Discord identity resolver');
  assert.match(identityHelper, /getGuildChannels/, 'identity resolver must fetch guild channel names');
  assert.match(identityHelper, /getGuildRoles/, 'identity resolver must fetch guild role names');
  assert.match(identityHelper, /getGuildUsers/, 'identity resolver must fetch guild member names');
  assert.match(identityHelper, /USER_LOOKUP_BATCH_SIZE/, 'member lookups should be batched');

  const label = read('src/components/dashboard/DiscordEntityLabel.tsx');
  assert.match(label, /FALLBACK_LABEL/, 'entity labels must have readable fallbacks');
  assert.match(label, /ID: \{id\}/, 'entity labels must keep the raw id available for audit/debugging');

  for (const rel of [
    'src/app/(dashboard)/dashboard/servers/[guildId]/analytics/page.tsx',
    'src/app/(dashboard)/dashboard/servers/[guildId]/logs/page.tsx',
    'src/app/(dashboard)/dashboard/servers/[guildId]/moderation/page.tsx',
    'src/app/(dashboard)/dashboard/servers/[guildId]/tickets/page.tsx',
    'src/app/(dashboard)/dashboard/servers/[guildId]/giveaways/page.tsx',
    'src/app/(dashboard)/dashboard/servers/[guildId]/roles/page.tsx',
    'src/app/(dashboard)/dashboard/servers/[guildId]/leveling/page.tsx',
    'src/app/(dashboard)/dashboard/servers/[guildId]/fanart/page.tsx',
    'src/components/dashboard/StreamAlertsManager.tsx',
  ]) {
    const source = read(rel);
    assert.match(source, /DiscordEntityLabel/, `${rel} must render entity labels instead of raw ids`);
  }

  assert.doesNotMatch(
    read('src/app/(dashboard)/dashboard/servers/[guildId]/analytics/page.tsx'),
    />Channel ID</,
    'analytics table should label channels by name',
  );
  assert.doesNotMatch(
    read('src/app/(dashboard)/dashboard/servers/[guildId]/leveling/page.tsx'),
    />User ID</,
    'leveling table should label users by name',
  );
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
